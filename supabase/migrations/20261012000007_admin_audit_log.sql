-- Roses N Chic: admin action log (plan.md Phase 8: "Log all admin actions").

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users (id) on delete set null,
  action text not null,
  target_table text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_log_admin_id_idx on public.admin_audit_log (admin_id);
create index admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

-- Admin-only, both ways: only admins can read the log, and the insert
-- check (not just the select policy) means even an authenticated non-admin
-- calling this table directly gets rejected -- admin server actions write
-- here using the regular RLS-bound client precisely because they *are*
-- an authorized admin, not via the service-role bypass.
create policy "admin_audit_log_admin_select" on public.admin_audit_log
  for select using (public.is_admin());
create policy "admin_audit_log_admin_insert" on public.admin_audit_log
  for insert with check (public.is_admin() and admin_id = auth.uid());
