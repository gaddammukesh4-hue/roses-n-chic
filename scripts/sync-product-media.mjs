#!/usr/bin/env node
/**
 * Matches images you've uploaded to the Supabase Storage "product-media"
 * bucket to products by folder name, and writes rows into product_media.
 *
 * Upload convention: one folder per product, named with the product's
 * slug (see supabase/README.md for the exact steps and current slug
 * list). Files inside a folder are ordered by filename -- name them
 * 01.jpg, 02.jpg, etc. so the first one becomes the cover image.
 *
 * Safe to re-run: each run replaces that product's product_media rows
 * entirely with the current folder contents, rather than accumulating
 * duplicates.
 *
 * Usage:
 *   node --env-file=.env.local scripts/sync-product-media.mjs
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with --env-file=.env.local.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);
const BUCKET = 'product-media';

async function main() {
  const { data: products, error: productsError } = await supabase.from('products').select('id, slug, name');
  if (productsError) throw productsError;
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const { data: folders, error: listError } = await supabase.storage.from(BUCKET).list('', { limit: 1000 });
  if (listError) throw listError;

  let matched = 0;
  let skipped = 0;

  for (const entry of folders) {
    // Storage lists both files and "folders" (prefixes) at the root; a
    // real folder has no `id`/metadata the way a file does.
    if (entry.id) continue;
    const slug = entry.name;
    const product = bySlug.get(slug);
    if (!product) {
      console.log(`Skipping folder "${slug}" -- no product with that slug.`);
      skipped++;
      continue;
    }

    const { data: files, error: filesError } = await supabase.storage.from(BUCKET).list(slug, { limit: 100, sortBy: { column: 'name', order: 'asc' } });
    if (filesError) throw filesError;
    const images = files.filter((f) => f.id);
    if (images.length === 0) {
      console.log(`Folder "${slug}" has no files, skipping.`);
      continue;
    }

    await supabase.from('product_media').delete().eq('product_id', product.id);

    const rows = images.map((file, i) => {
      const path = `${slug}/${file.name}`;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return { product_id: product.id, image_url: pub.publicUrl, sort_order: i };
    });
    const { error: insertError } = await supabase.from('product_media').insert(rows);
    if (insertError) throw insertError;

    console.log(`✓ ${product.name} (${slug}): ${images.length} image(s)`);
    matched++;
  }

  console.log(`\nDone. ${matched} product(s) updated, ${skipped} folder(s) skipped (no matching product).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
