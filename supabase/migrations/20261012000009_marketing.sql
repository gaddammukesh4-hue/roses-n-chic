-- Roses N Chic: Phase 9 (marketing) tables.
--
-- newsletter_subscribers: the footer email sign-up form (plan.md Phase 9,
-- item 7). page_views: a minimal, privacy-respecting analytics log (no IP,
-- no user agent, no cookie/visitor ID -- just path + referrer + when) so the
-- site has real traffic numbers without needing a third-party analytics
-- account or any personal-data retention decision before launch.

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) <= 254 and email like '%_@_%'),
  created_at timestamptz not null default now()
);

create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null check (char_length(path) <= 300 and path like '/%'),
  referrer text check (referrer is null or char_length(referrer) <= 300),
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;
alter table public.page_views enable row level security;

-- Anyone (including signed-out visitors) can sign up or generate a page
-- view, but nobody can read these back except the service role / an admin
-- query run server-side -- there's no "list subscribers" or "see analytics"
-- client-side read path, so a leaked anon key can't be used to scrape the
-- email list or page-view log.
create policy newsletter_subscribers_insert_anyone on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);

create policy page_views_insert_anyone on public.page_views
  for insert to anon, authenticated with check (true);

-- Admins can read both from the admin panel (app/admin/analytics).
create policy newsletter_subscribers_select_admin on public.newsletter_subscribers
  for select to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  );

create policy page_views_select_admin on public.page_views
  for select to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  );

create index page_views_created_at_idx on public.page_views (created_at desc);
create index page_views_path_idx on public.page_views (path);
