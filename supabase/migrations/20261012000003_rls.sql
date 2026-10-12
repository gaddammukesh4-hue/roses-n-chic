-- Roses N Chic: Row Level Security on every table (plan.md Phase 4 + Part C).
--
-- Rule enforced here: public can read active products; a user can read/write
-- only their own rows; orders, order_items and payment_events have NO
-- insert/update policy for authenticated/anon at all -- with RLS enabled and
-- no matching policy, Postgres default-denies, so only the server-side
-- service-role client (which bypasses RLS entirely by design) can write
-- them. That is "only the server can write orders and payments."

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_media enable row level security;
alter table public.measurements enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_events enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- products: public reads active only; admin has full access
create policy "products_select_active" on public.products
  for select using (status = 'active' or public.is_admin());
create policy "products_admin_insert" on public.products
  for insert with check (public.is_admin());
create policy "products_admin_update" on public.products
  for update using (public.is_admin()) with check (public.is_admin());
create policy "products_admin_delete" on public.products
  for delete using (public.is_admin());

-- product_variants: readable when the parent product is readable
create policy "variants_select" on public.product_variants
  for select using (
    exists (select 1 from public.products p where p.id = product_id and (p.status = 'active' or public.is_admin()))
  );
create policy "variants_admin_insert" on public.product_variants
  for insert with check (public.is_admin());
create policy "variants_admin_update" on public.product_variants
  for update using (public.is_admin()) with check (public.is_admin());
create policy "variants_admin_delete" on public.product_variants
  for delete using (public.is_admin());

-- product_media: same pattern
create policy "media_select" on public.product_media
  for select using (
    exists (select 1 from public.products p where p.id = product_id and (p.status = 'active' or public.is_admin()))
  );
create policy "media_admin_insert" on public.product_media
  for insert with check (public.is_admin());
create policy "media_admin_update" on public.product_media
  for update using (public.is_admin()) with check (public.is_admin());
create policy "media_admin_delete" on public.product_media
  for delete using (public.is_admin());

-- measurements: strictly the owning user
create policy "measurements_select_own" on public.measurements
  for select using (auth.uid() = user_id);
create policy "measurements_insert_own" on public.measurements
  for insert with check (auth.uid() = user_id);
create policy "measurements_update_own" on public.measurements
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "measurements_delete_own" on public.measurements
  for delete using (auth.uid() = user_id);

-- addresses: strictly the owning user
create policy "addresses_select_own" on public.addresses
  for select using (auth.uid() = user_id);
create policy "addresses_insert_own" on public.addresses
  for insert with check (auth.uid() = user_id);
create policy "addresses_update_own" on public.addresses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "addresses_delete_own" on public.addresses
  for delete using (auth.uid() = user_id);

-- carts: strictly the owning user
create policy "carts_select_own" on public.carts
  for select using (auth.uid() = user_id);
create policy "carts_insert_own" on public.carts
  for insert with check (auth.uid() = user_id);
create policy "carts_update_own" on public.carts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "carts_delete_own" on public.carts
  for delete using (auth.uid() = user_id);

-- cart_items: owned via the parent cart
create policy "cart_items_select_own" on public.cart_items
  for select using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
create policy "cart_items_insert_own" on public.cart_items
  for insert with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
create policy "cart_items_update_own" on public.cart_items
  for update
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
create policy "cart_items_delete_own" on public.cart_items
  for delete using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

-- orders: a user (or admin) can READ their own; no client write policy at
-- all -- creation/payment status changes go through the service-role server
-- action only (Phase 7).
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- order_items: readable iff the parent order is readable; no client write
create policy "order_items_select" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

-- payment_events: admin-only read; no client write at all (webhook handler
-- uses the service-role client exclusively)
create policy "payment_events_admin_select" on public.payment_events
  for select using (public.is_admin());
