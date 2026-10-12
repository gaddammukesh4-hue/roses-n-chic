-- Roses N Chic: seed data (plan.md Phase 4, "6 sample dresses").
-- Prices are minor units: price_inr in paise, price_usd in cents.
-- No product_media rows -- there is no real product photography yet, only
-- the hero's model/dress frames, which are not individual product shots.

insert into public.products (slug, name, description, fabric_notes, price_inr, price_usd, status) values
  ('the-muse-wrap-dress', 'The Muse Wrap Dress', 'A one-shoulder wrap silhouette with a hand-stitched fabric rose at the shoulder, embroidered down the bodice.', 'Handloom pure cotton, fully lined.', 640000, 7900, 'active'),
  ('the-needle-blouse', 'The Needle Blouse', 'A fitted blouse with floral stitch embroidery traced by hand, finished with mother-of-pearl buttons.', 'Handloom cotton, light weight.', 280000, 3400, 'active'),
  ('glow-up-maxi', 'Glow Up Maxi', 'A floor-length dress in soft viscose rayon, cut to move with gentle volume through the skirt.', 'Viscose rayon, breathable drape.', 540000, 6600, 'active'),
  ('chennai-atelier-kurta', 'Chennai Atelier Kurta', 'A straight-cut kurta with a rose-gold trim at the neckline, made in our Chennai workroom.', 'Handloom cotton.', 320000, 3900, 'active'),
  ('petal-sleeve-top', 'Petal Sleeve Top', 'A blouse with soft petal sleeves and a rounded neckline, finished with a delicate rose appliqué.', 'Viscose rayon blend.', 240000, 2900, 'active'),
  ('ivory-rose-saree', 'Ivory Rose Saree', 'A handwoven saree in ivory with a champagne-gold border and scattered rose motifs.', 'Handloom pure cotton.', 820000, 9900, 'draft');

-- sizes per product (stock counts are placeholder starting inventory)
insert into public.product_variants (product_id, size, stock_count)
select p.id, v.size, v.stock_count
from public.products p
cross join lateral (
  values ('XS', 4), ('S', 8), ('M', 10), ('L', 6), ('XL', 3)
) as v(size, stock_count)
where p.slug in (
  'the-muse-wrap-dress', 'the-needle-blouse', 'glow-up-maxi',
  'chennai-atelier-kurta', 'petal-sleeve-top', 'ivory-rose-saree'
);
