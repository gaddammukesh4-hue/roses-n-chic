import Image from 'next/image';
import Link from 'next/link';
import type { Product, Currency } from '@/lib/catalog-types';
import { formatPrice } from '@/lib/catalog-types';

export default function ProductCard({ product, currency }: { product: Product; currency: Currency }) {
  const price = currency === 'INR' ? product.price_inr : product.price_usd;
  const inStock = product.product_variants.some((v) => v.stock_count > 0);
  const image = product.product_media.find((m) => m.image_url)?.image_url ?? null;

  return (
    <Link
      href={`/collections/${product.slug}`}
      className="group block rounded-md border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-base"
    >
      <div className="relative aspect-[4/5] bg-gradient-to-br from-blush to-champagne">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          // No photo uploaded for this product yet -- brand-gradient
          // placeholder instead of a broken image (supabase/README.md has
          // the upload steps).
          <span className="absolute inset-0 flex items-center justify-center text-display font-serif text-white/70" aria-hidden="true">
            {product.name.charAt(0)}
          </span>
        )}
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
