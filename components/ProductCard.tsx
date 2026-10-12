import Link from 'next/link';
import type { Product, Currency } from '@/lib/catalog-types';
import { formatPrice } from '@/lib/catalog-types';

/**
 * No product photography or reels exist yet (see hero/README.md -- the hero
 * frames are a styled video sequence, not per-product shots), so this shows
 * a brand-gradient placeholder instead of next/image. Swap in a real <Image>
 * once product_media has rows -- the video-badge/hover-reel behavior from
 * plan.md Phase 5 steps 3-5 is deferred until then (see PROGRESS.md).
 */
export default function ProductCard({ product, currency }: { product: Product; currency: Currency }) {
  const price = currency === 'INR' ? product.price_inr : product.price_usd;
  const inStock = product.product_variants.some((v) => v.stock_count > 0);

  return (
    <Link
      href={`/collections/${product.slug}`}
      className="group block rounded-md border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-base"
    >
      <div className="aspect-[4/5] bg-gradient-to-br from-blush to-champagne flex items-center justify-center">
        <span className="text-display font-serif text-white/70" aria-hidden="true">
          {product.name.charAt(0)}
        </span>
      </div>
      <div className="p-4 space-y-1">
        <p className="text-caption uppercase tracking-[0.18em] text-accent">{product.fabric}</p>
        <h3 className="text-h4 group-hover:text-secondary transition-colors duration-base">{product.name}</h3>
        <p className="text-body-sm">
          {formatPrice(price, currency)}
          {!inStock && <span className="text-muted-foreground"> · Sold out</span>}
        </p>
      </div>
    </Link>
  );
}
