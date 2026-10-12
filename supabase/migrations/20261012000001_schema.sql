-- Roses N Chic: core schema (Phase 4)
-- Money columns store minor currency units (paise for INR, cents for USD)
-- to avoid floating point error -- e.g. price_inr = 640000 means INR 6,400.00.

create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  fabric_notes text,
  price_inr integer not null check (price_inr >= 0),
  price_usd integer not null check (price_usd >= 0),
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_status_idx on public.products (status);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text not null check (size in ('XS', 'S', 'M', 'L', 'XL', 'Custom')),
  stock_count integer not null default 0 check (stock_count >= 0),
  created_at timestamptz not null default now(),
  unique (product_id, size)
);

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text,
  reel_video_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index product_media_product_id_idx on public.product_media (product_id);

create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'My measurements',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index measurements_user_id_idx on public.measurements (user_id);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'IN',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index addresses_user_id_idx on public.addresses (user_id);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  -- null user_id = guest cart, tracked client-side only; a cart ever
  -- persisted to this table for a signed-in user always has user_id set.
  user_id uuid references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index carts_user_id_key on public.carts (user_id) where user_id is not null;

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_variant_id uuid not null references public.product_variants (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, product_variant_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded', 'cancelled', 'fulfilled')),
  currency text not null check (currency in ('INR', 'USD')),
  subtotal integer not null check (subtotal >= 0),
  total integer not null check (total >= 0),
  payment_provider text check (payment_provider in ('razorpay', 'stripe')),
  payment_id text,
  shipping_address jsonb,
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);

-- order_items snapshots name/size/price at purchase time -- never join back
-- to the live product/variant for historical price, per plan.md Phase 7.
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_variant_id uuid not null references public.product_variants (id) on delete restrict,
  product_name text not null,
  size text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);
create index order_items_order_id_idx on public.order_items (order_id);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('razorpay', 'stripe')),
  event_id text not null,
  order_id uuid references public.orders (id) on delete set null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);
