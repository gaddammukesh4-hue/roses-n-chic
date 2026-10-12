import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import CurrencyToggle from '@/components/CurrencyToggle';
import { getProducts, hasSupabaseConfig, type Fabric, type Size, type CatalogFilters } from '@/lib/catalog';
import { getCurrency } from '@/app/actions/currency';

export const metadata: Metadata = {
  title: 'Collections | Roses N Chic',
  description: "Handcrafted handloom cotton and viscose rayon women's clothing from our Chennai atelier.",
};

// Filters (searchParams) and the currency cookie are genuinely per-request --
// this is an e-commerce catalog, not a candidate for static prerendering.
export const instant = false;

type SearchParams = Promise<{ fabric?: string; size?: string; price?: string }>;

export default async function CollectionsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const currency = await getCurrency();

  const filters: CatalogFilters = {
    fabric: params.fabric as Fabric | undefined,
    size: params.size as Size | undefined,
    priceRange: params.price as CatalogFilters['priceRange'],
  };

  const configured = hasSupabaseConfig();
  const products = configured ? await getProducts(filters) : [];

  return (
    <>
      <Nav />
      <main className="pt-[calc(var(--nav-h,76px)+40px)] pb-24 px-6 max-w-6xl mx-auto">
        <header className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-caption uppercase tracking-[0.18em] text-muted-foreground">The collection</p>
            <h1 className="text-h1">Collections</h1>
          </div>
          <CurrencyToggle currency={currency} />
        </header>

        {!configured ? (
          <div className="rounded-md border border-border bg-card p-12 text-center space-y-2">
            <h2 className="text-h3">Coming soon</h2>
            <p className="text-body-sm text-muted-foreground max-w-md mx-auto">
              The catalog is connected to the database but no Supabase project is linked yet
              (see supabase/README.md). Once it is, products added there appear here automatically.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <ProductFilters />
            </div>
            {products.length === 0 ? (
              <div className="rounded-md border border-border bg-card p-12 text-center space-y-2">
                <h2 className="text-h3">No pieces match yet</h2>
                <p className="text-body-sm text-muted-foreground">Try a different fabric, size, or price range.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} currency={currency} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
