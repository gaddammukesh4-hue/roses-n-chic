'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import type { Product } from '@/lib/catalog-types';

export default function AddToBag({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedId, setSelectedId] = useState<string | null>(
    product.product_variants.find((v) => v.stock_count > 0)?.id ?? null,
  );
  const [justAdded, setJustAdded] = useState(false);

  const selected = product.product_variants.find((v) => v.id === selectedId) ?? null;

  async function handleAdd() {
    if (!selected || selected.stock_count <= 0) return;
    await addItem({
      variantId: selected.id,
      productSlug: product.slug,
      productName: product.name,
      size: selected.size,
      priceInr: product.price_inr,
      priceUsd: product.price_usd,
      stockCount: selected.stock_count,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <section>
      <h2 className="text-h4 mb-3">Size</h2>
      <table className="w-full text-body-sm border border-border rounded-md overflow-hidden">
        <thead>
          <tr className="bg-muted text-left">
            <th className="px-4 py-2 font-medium" />
            <th className="px-4 py-2 font-medium">Size</th>
            <th className="px-4 py-2 font-medium">Availability</th>
          </tr>
        </thead>
        <tbody>
          {product.product_variants.map((v) => {
            const disabled = v.stock_count <= 0;
            return (
              <tr
                key={v.id}
                onClick={() => !disabled && setSelectedId(v.id)}
                className={`border-t border-border ${disabled ? 'opacity-50' : 'cursor-pointer hover:bg-muted/60'}`}
              >
                <td className="px-4 py-2">
                  <input
                    type="radio"
                    name="size"
                    value={v.size}
                    checked={selectedId === v.id}
                    disabled={disabled}
                    onChange={() => setSelectedId(v.id)}
                    aria-label={`Size ${v.size}`}
                  />
                </td>
                <td className="px-4 py-2">{v.size}</td>
                <td className="px-4 py-2 text-muted-foreground">{disabled ? 'Sold out' : 'In stock'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-caption text-muted-foreground mt-2">
        Custom Tailored sizing (using your saved measurements) is planned for a future update.
      </p>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!selected || selected.stock_count <= 0}
        className="w-full mt-6 rounded-none bg-primary text-on-primary px-11 py-[15px] text-body-sm uppercase tracking-[0.14em] transition-colors duration-base hover:bg-secondary active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {justAdded ? 'Added to bag' : 'Add to bag'}
      </button>
    </section>
  );
}
