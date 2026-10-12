import { createClient } from '@/lib/supabase/server';
import type { Product, CatalogFilters } from '@/lib/catalog-types';

export * from '@/lib/catalog-types';

/** True once a real Supabase project is linked (Phase 0/4) -- until then every
 * catalog query would throw on the empty URL, so callers should check this
 * first and render the "coming soon" state instead. */
export function hasSupabaseConfig(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

const PRICE_RANGES: Record<NonNullable<CatalogFilters['priceRange']>, [number, number | null]> = {
  'under-4000': [0, 400000],
  '4000-7000': [400000, 700000],
  'over-7000': [700000, null],
};

export async function getProducts(filters: CatalogFilters = {}): Promise<Product[]> {
  if (!hasSupabaseConfig()) return [];

  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select('id, slug, name, description, fabric, fabric_notes, care_notes, price_inr, price_usd, status, product_variants(id, size, stock_count)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (filters.fabric) query = query.eq('fabric', filters.fabric);
  if (filters.priceRange) {
    const [min, max] = PRICE_RANGES[filters.priceRange];
    query = query.gte('price_inr', min);
    if (max !== null) query = query.lt('price_inr', max);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load products: ${error.message}`);

  let products = (data ?? []) as Product[];
  if (filters.size) {
    products = products.filter((p) => p.product_variants.some((v) => v.size === filters.size && v.stock_count > 0));
  }
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasSupabaseConfig()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, description, fabric, fabric_notes, care_notes, price_inr, price_usd, status, product_variants(id, size, stock_count)')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw new Error(`Failed to load product "${slug}": ${error.message}`);
  return data as Product | null;
}
