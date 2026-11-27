-- =====================================================================
-- Betsel Stack - Added users (multi-user licensing)
-- Run once in Supabase -> SQL Editor -> New query -> Run.
-- Safe to re-run (uses IF NOT EXISTS).
--
-- How it works: a subscriber (the "owner") adds people by email. Each row
-- here is one added user. When someone signs up or logs in with an email on
-- this list, and the owner's subscription is active, they get full access.
-- Billing is an "Additional user" line on the owner's Stripe subscription
-- ($10/month or $96/year each); its quantity is kept equal to the number of
-- rows here by app/api/team/route.js.
-- =====================================================================

create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  -- Always stored lowercase (the API lowercases before insert).
  email       text not null check (email = lower(email)),
  created_at  timestamptz not null default now(),
  -- One email can be on only one subscriber's list at a time.
  unique (email)
);

create index if not exists team_members_owner_idx
  on public.team_members (owner_id, created_at);

-- Owners can read their own list. All writes go through the server API
-- (service role), so there are no insert/update/delete policies.
alter table public.team_members enable row level security;

drop policy if exists "owners read own team" on public.team_members;
create policy "owners read own team"
  on public.team_members for select
  using (auth.uid() = owner_id);

-- How many added users the owner's subscription is currently paying for.
-- Written by the Stripe webhook from the "Additional user" line quantity.
-- Access checks only honor that many rows (oldest first), so a list left
-- over from a cancelled subscription never grants free access.
alter table public.subscriptions
  add column if not exists extra_seats int not null default 0;
