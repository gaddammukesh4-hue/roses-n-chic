import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import CurrencyToggle from '@/components/CurrencyToggle';
import AddToBag from '@/components/AddToBag';
import { getProductBySlug, hasSupabaseConfig, formatPrice } from '@/lib/catalog';
import { getCurrency } from '@/app/actions/currency';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  if (!hasSupabaseConfig()) return { title: 'Collections | Roses N Chic' };
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Collections | Roses N Chic' };
  return {
    title: `${product.name} | Roses N Chic`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  if (!hasSupabaseConfig()) notFound();

  const { slug } = await params;
  const [product, currency] = await Promise.all([getProductBySlug(slug), getCurrency()]);
  if (!product) notFound();

  const price = currency === 'INR' ? product.price_inr : product.price_usd;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: currency,
      price: (price / 100).toFixed(2),
      availability: product.product_variants.some((v) => v.stock_count > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main className="pt-[calc(var(--nav-h,76px)+40px)] pb-24 px-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* No product photography yet -- see ProductCard.tsx for why. */}
        <div className="aspect-[4/5] rounded-md bg-gradient-to-br from-blush to-champagne flex items-center justify-center">
          <span className="text-display font-serif text-white/70" aria-hidden="true">
            {product.name.charAt(0)}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-caption uppercase tracking-[0.18em] text-accent">{product.fabric}</p>
            <h1 className="text-h1">{product.name}</h1>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-h3">{formatPrice(price, currency)}</p>
            <CurrencyToggle currency={currency} />
          </div>

          {product.description && <p className="text-body-lg text-muted-foreground">{product.description}</p>}

          {(product.fabric_notes || product.care_notes) && (
            <section className="space-y-3">
              {product.fabric_notes && (
                <div>
                  <h2 className="text-h4 mb-1">Fabric</h2>
                  <p className="text-body-sm text-muted-foreground">{product.fabric_notes}</p>
                </div>
              )}
              {product.care_notes && (
                <div>
                  <h2 className="text-h4 mb-1">Care</h2>
                  <p className="text-body-sm text-muted-foreground">{product.care_notes}</p>
                </div>
              )}
            </section>
          )}

          <AddToBag product={product} />
        </div>
      </main>
    </>
  );
}
