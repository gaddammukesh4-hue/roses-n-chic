# Supabase: Phase 4 database

Everything here is code, already committed, and does not require a live
Supabase project to exist. It only needs one to actually *run*.

## What's here

- `migrations/20261012000001_schema.sql` — the 11 tables from plan.md Phase 4
  (products, product_variants, product_media, profiles, measurements,
  addresses, carts, cart_items, orders, order_items, payment_events). Money
  columns store minor units (paise / cents) to avoid float error.
- `migrations/20261012000002_triggers.sql` — `updated_at` bookkeeping, and
  auto-creates a `profiles` row when someone signs up via Supabase Auth.
- `migrations/20261012000003_rls.sql` — Row Level Security on every table.
  Public reads active products only; a user reads/writes only their own
  rows; `orders`, `order_items`, `payment_events` have **no** client write
  policy at all, so only the service-role client (`lib/supabase/admin.ts`,
  Phase 7) can write them.
- `seed.sql` — 6 sample dresses with XS-XL variants (no `product_media` rows
  yet; there's no real product photography, only the hero's frames).

## What you need to do (requires your Supabase login — I can't do this part)

1. Create a Supabase project named `rnc-dev` at supabase.com (plan.md Phase 0, item 4).
2. Either:
   - **Link + push** (applies migrations to the real project):
     ```bash
     npx supabase login
     npx supabase link --project-ref <your-project-ref>
     npx supabase db push
     npx supabase db execute -f supabase/seed.sql   # optional, sample data
     ```
   - **Or run locally first** (needs Docker Desktop running):
     ```bash
     npx supabase start
     npx supabase db reset   # applies migrations + seed.sql to the local instance
     ```
3. Copy `.env.local.example` to `.env.local` and fill in the three
   `NEXT_PUBLIC_SUPABASE_*` / `SUPABASE_SERVICE_ROLE_KEY` values from your
   project's API settings page.
4. In the Supabase dashboard, open the `profiles` table for your own user
   (after signing up once Phase 6 adds auth) and set `is_admin = true` by
   hand — there's no self-serve admin signup, on purpose.

## Uploading product photos

The `product-media` Storage bucket exists (public, created 2026-10-12,
10MB/file limit, jpeg/png/webp only) and `product_media` has RLS matching
every other admin-write table. You upload the files yourself through the
Supabase dashboard; I match them to products afterward with a script.

1. In the Supabase dashboard, go to **Storage → product-media**.
2. For each product, **create a folder named exactly after its slug**:
   `the-muse-wrap-dress`, `the-needle-blouse`, `glow-up-maxi`,
   `chennai-atelier-kurta`, `petal-sleeve-top`, `ivory-rose-saree`
   (the full current list is `select slug, name from products`).
3. Inside each folder, upload that product's photos named so they sort in
   the order you want them shown — `01.jpg`, `02.jpg`, etc. The first file
   alphabetically becomes the cover image everywhere (catalog grid and the
   product page's gallery).
4. Tell me when you're done (or just do it any time — I can run the sync
   whenever) and I'll run:
   ```bash
   node --env-file=.env.local scripts/sync-product-media.mjs
   ```
   This replaces each matched product's `product_media` rows with the
   current folder contents -- safe to re-run after adding or swapping
   photos later. A folder whose name doesn't match any product's slug is
   skipped and reported, not silently ignored.

Until a product has at least one photo, the catalog shows a brand-gradient
placeholder with the product's initial instead of a broken image -- nothing
breaks in the meantime.

## Verifying Phase 4's "Done when" criterion

Plan.md: "you can add a product in the database and it shows on the site. A
test user cannot read another user's data." That needs a live project and
the catalog page (Phase 5) to actually render products — it can't be
verified from migration files alone. Once your project is linked:

```bash
# as the anon key (simulates an unauthenticated visitor) -- should return
# only status='active' products:
curl "<project-url>/rest/v1/products?select=*" -H "apikey: <anon-key>"

# a request for another user's row (e.g. measurements) with a different
# user's JWT should return an empty array, not an error and not their data.
```
