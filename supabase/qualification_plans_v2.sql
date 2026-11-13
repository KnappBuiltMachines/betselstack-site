-- Betsel Stack — Qualification Plans v2: e-approvals, results, "completed" status.
-- Paste this whole script into Supabase → SQL Editor and click Run. Safe to re-run.

alter table public.qualification_plans
  add column if not exists approvals    jsonb not null default '[]'::jsonb,
  add column if not exists approved_at  timestamptz,
  add column if not exists results      jsonb not null default '{}'::jsonb,
  add column if not exists completed_at timestamptz;

alter table public.qualification_plans
  drop constraint if exists qualification_plans_status_check;
alter table public.qualification_plans
  add constraint qualification_plans_status_check
  check (status in ('draft','in_review','approved','completed','obsolete'));
