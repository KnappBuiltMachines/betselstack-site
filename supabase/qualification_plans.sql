-- =====================================================================
-- Betsel Stack — Qualification Plan Creator
-- Run once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Per-user, per-year counter used to issue plan numbers.
--    QP-2026-0001, QP-2026-0002, ... restarting at 0001 each January.
--    Only the SECURITY DEFINER trigger below touches this table, so RLS
--    is enabled with NO policies (users can't read or edit it directly).
-- ---------------------------------------------------------------------
create table if not exists public.qp_counters (
  user_id  uuid not null references auth.users(id) on delete cascade,
  year     int  not null,
  last_seq int  not null default 0,
  primary key (user_id, year)
);
alter table public.qp_counters enable row level security;

-- ---------------------------------------------------------------------
-- 2) Qualification plans
-- ---------------------------------------------------------------------
create table if not exists public.qualification_plans (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,

  -- Identification (plan_number is assigned by the trigger on insert)
  plan_number   text not null,
  revision      text not null default 'A',
  status        text not null default 'draft'
                check (status in ('draft','in_review','approved','obsolete')),

  -- Copied out of `inputs` so they can be searched / listed cheaply
  title         text not null default 'Untitled qualification plan',
  customer      text,
  product_name  text,
  sku           text,
  risk_level    text check (risk_level in ('Low','Medium','High')),
  risk_score    int,

  -- Everything the user entered in the wizard
  inputs        jsonb not null default '{}'::jsonb,
  -- Snapshot of the generated plan (risk, tests, criteria…) at save time,
  -- so an approved plan never changes if the rules engine is updated later
  content       jsonb not null default '{}'::jsonb,
  -- [{ rev, date, by, note }]
  rev_history   jsonb not null default '[]'::jsonb,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  unique (user_id, plan_number)
);

create index if not exists qualification_plans_user_idx
  on public.qualification_plans (user_id, created_at desc);

-- (Search uses ILIKE on plan_number/title/customer/product_name/sku —
--  fast at per-user scale; add a pg_trgm index later if needed.)

-- ---------------------------------------------------------------------
-- 3) Row Level Security — users only ever see their own plans
-- ---------------------------------------------------------------------
alter table public.qualification_plans enable row level security;

drop policy if exists "qp_select_own" on public.qualification_plans;
create policy "qp_select_own" on public.qualification_plans
  for select using (auth.uid() = user_id);

drop policy if exists "qp_insert_own" on public.qualification_plans;
create policy "qp_insert_own" on public.qualification_plans
  for insert with check (auth.uid() = user_id);

drop policy if exists "qp_update_own" on public.qualification_plans;
create policy "qp_update_own" on public.qualification_plans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "qp_delete_own" on public.qualification_plans;
create policy "qp_delete_own" on public.qualification_plans
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 4) Plan number assignment (atomic — no duplicates under concurrency)
-- ---------------------------------------------------------------------
create or replace function public.assign_qp_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  yr  int := extract(year from now())::int;
  seq int;
begin
  insert into public.qp_counters as c (user_id, year, last_seq)
  values (new.user_id, yr, 1)
  on conflict (user_id, year)
  do update set last_seq = c.last_seq + 1
  returning last_seq into seq;

  new.plan_number := 'QP-' || yr::text || '-' || lpad(seq::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists qualification_plans_number on public.qualification_plans;
create trigger qualification_plans_number
  before insert on public.qualification_plans
  for each row execute function public.assign_qp_number();

-- Keep updated_at fresh and stop plan_number / user_id from being changed
create or replace function public.qp_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at  := now();
  new.plan_number := old.plan_number;
  new.user_id     := old.user_id;
  return new;
end;
$$;

drop trigger if exists qualification_plans_touch on public.qualification_plans;
create trigger qualification_plans_touch
  before update on public.qualification_plans
  for each row execute function public.qp_touch();
