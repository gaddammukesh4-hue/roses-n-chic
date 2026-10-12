-- Roses N Chic: link page_views to the signed-in visitor, when there is
-- one. Anonymous (signed-out) visits still carry no identifying data at
-- all -- user_id stays null, same privacy stance as before. This is the
-- feature described in the Privacy policy's "What we collect" and
-- "Cookies" sections (updated 2026-10-13): signed-in browsing is linked
-- to the account for the owner's own promotional-email use, never shared
-- or sold.
alter table public.page_views add column user_id uuid references auth.users(id) on delete set null;
create index page_views_user_id_idx on public.page_views (user_id) where user_id is not null;
