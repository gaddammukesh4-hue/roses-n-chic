-- Roses N Chic: let admins read every profile, not just their own.
--
-- The admin Orders page needs to show the customer's name/phone alongside
-- each order -- previously only `profiles_select_own` existed, so an
-- admin querying another user's profile with the regular RLS-bound client
-- got nothing back. Same pattern as every other admin-read policy in this
-- schema (newsletter_subscribers_select_admin, page_views_select_admin):
-- RLS itself is the authorization, not app-code bypassing it with the
-- service-role client.
create policy "profiles_select_admin" on public.profiles
  for select to authenticated using (public.is_admin());
