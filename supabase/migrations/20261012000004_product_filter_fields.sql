-- Roses N Chic: structured fabric field for catalog filtering (Phase 5), and
-- a care_notes field for the product page. fabric_notes stays as-is for
-- free-text detail (e.g. "fully lined") -- fabric is the clean filter value.

alter table public.products
  add column fabric text not null default 'Handloom Cotton' check (fabric in ('Handloom Cotton', 'Viscose Rayon')),
  add column care_notes text;

create index products_fabric_idx on public.products (fabric);
