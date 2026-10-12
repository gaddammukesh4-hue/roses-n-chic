/**
 * Pure types/constants/formatters -- no server-only imports (next/headers,
 * Supabase clients). Safe to import from Client Components. lib/catalog.ts
 * re-exports all of this plus the actual data-fetching functions, for
 * convenience in Server Components.
 */

export type Currency = 'INR' | 'USD';
export const FABRICS = ['Handloom Cotton', 'Viscose Rayon'] as const;
export type Fabric = (typeof FABRICS)[number];
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Custom'] as const;
export type Size = (typeof SIZES)[number];

export type ProductVariant = {
  id: string;
  size: Size;
  stock_count: number;
};

export type ProductMedia = {
  id: string;
  image_url: string | null;
  reel_video_url: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  fabric: Fabric;
  fabric_notes: string | null;
  care_notes: string | null;
  price_inr: number;
  price_usd: number;
  status: 'draft' | 'active' | 'archived';
  product_variants: ProductVariant[];
  product_media: ProductMedia[];
};

export type CatalogFilters = {
  fabric?: Fabric;
  size?: Size;
  /** Bucketed against price_inr regardless of display currency -- see ProductFilters component. */
  priceRange?: 'under-4000' | '4000-7000' | 'over-7000';
};

export function formatPrice(minorUnits: number, currency: Currency): string {
  const major = minorUnits / 100;
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: major % 1 === 0 ? 0 : 2,
  }).format(major);
}
