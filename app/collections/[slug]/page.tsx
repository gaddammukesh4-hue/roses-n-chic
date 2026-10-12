import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import CurrencyToggle from '@/components/CurrencyToggle';
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

          <section>
            <h2 className="text-h4 mb-3">Size</h2>
            <table className="w-full text-body-sm border border-border rounded-md overflow-hidden">
              <thead>
                <tr className="bg-muted text-left">
                  <th className="px-4 py-2 font-medium">Size</th>
                  <th className="px-4 py-2 font-medium">Availability</th>
                </tr>
              </thead>
              <tbody>
                {product.product_variants.map((v) => (
                  <tr key={v.id} className="border-t border-border">
                    <td className="px-4 py-2">{v.size}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {v.stock_count > 0 ? 'In stock' : 'Sold out'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-caption text-muted-foreground mt-2">
              Custom Tailored sizing (using your saved measurements) opens once accounts ship (Phase 6).
            </p>
          </section>

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

          <button
            disabled
            title="Cart opens in Phase 7"
            className="w-full rounded-none bg-primary text-on-primary px-11 py-[15px] text-body-sm uppercase tracking-[0.14em] opacity-50 cursor-not-allowed"
          >
            Add to bag (coming in Phase 7)
          </button>
        </div>
      </main>
    </>
  );
}
