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

## Adding real products, photos, and videos

As of 2026-10-12 the catalog is empty on purpose -- the 6 placeholder
dresses used to test Phases 4-8 were removed once the admin panel (Phase 8)
was verified working, so real inventory starts from a clean slate.

**Primary path: the admin panel.** Sign in on the site (email/password or
Google), then visit `/admin/products/new`. Covers
name/description/fabric/notes/prices/status, per-size stock, photo upload,
and reel video upload (an actual video file, MP4/WebM/MOV up to 50MB --
or paste an external URL instead if you'd rather host it elsewhere) --
both upload straight to Storage from the product's edit page, no
folder-naming needed. You need an admin account first: sign up normally
through the site, then tell Claude your account's email so
`profiles.is_admin` can be set to `true` -- there's no self-serve admin
signup, on purpose.

**Alternative for bulk photo uploads:** the `product-media` Storage bucket
(public, 50MB/file limit, jpeg/png/webp/mp4/webm/quicktime) also accepts
uploads directly through the Supabase dashboard if you'd rather add many
photos at once outside the admin panel:

1. **Storage → product-media**, create a folder named exactly after the
   product's slug (`select slug, name from products` for the current list).
2. Upload photos inside named to sort in the order you want --
   `01.jpg`, `02.jpg`, etc. The first one becomes the cover image.
3. Run the sync script to match folders to products:
   ```bash
   node --env-file=.env.local scripts/sync-product-media.mjs
   ```
   Replaces that product's `product_media` rows with the folder's current
   contents -- safe to re-run after adding or swapping photos. A folder
   whose name doesn't match any product's slug is skipped and reported,
   not silently ignored.

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
