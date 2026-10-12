-- Roses N Chic: Phase 10 (security) -- rate limiting storage.
--
-- plan.md Part C: "Rate limits on sign-in, sign-up, password reset, and
-- checkout." lib/rate-limit.ts writes/reads this table through the
-- service-role client only (same pattern as payment_events/admin_audit_log)
-- -- RLS has no insert/select policy for anon/authenticated at all, so a
-- leaked anon key can't be used to read or forge another IP's bucket.
create table public.rate_limit_hits (
  id bigint generated always as identity primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);

alter table public.rate_limit_hits enable row level security;

create index rate_limit_hits_bucket_created_idx on public.rate_limit_hits (bucket, created_at desc);
