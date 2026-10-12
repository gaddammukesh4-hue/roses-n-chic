'use client';

import { useState, useTransition } from 'react';
import { SIZES } from '@/lib/catalog-types';
import { upsertVariant } from '@/app/actions/admin-products';

type Variant = { id: string; size: string; stock_count: number };

export default function VariantEditor({ productId, initialVariants }: { productId: string; initialVariants: Variant[] }) {
  const bySize = new Map(initialVariants.map((v) => [v.size, v.stock_count]));
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(SIZES.map((s) => [s, String(bySize.get(s) ?? '')])),
  );
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave(size: string) {
    setError(null);
    const stock = Number(values[size]);
    startTransition(async () => {
      const result = await upsertVariant(productId, size, Number.isFinite(stock) ? stock : 0);
      if (result.error) setError(result.error);
      else {
        setSaved((s) => ({ ...s, [size]: true }));
        setTimeout(() => setSaved((s) => ({ ...s, [size]: false })), 1500);
      }
    });
  }

  return (
    <div className="space-y-2">
      {SIZES.map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-16 text-body-sm">{size}</span>
          <input
            type="number"
            min="0"
            step="1"
            value={values[size]}
            onChange={(e) => setValues((v) => ({ ...v, [size]: e.target.value }))}
            className="w-24 rounded-sm border border-border bg-card px-3 py-1.5 text-body-sm"
          />
          <button
            type="button"
            onClick={() => handleSave(size)}
            disabled={pending}
            className="text-body-sm text-secondary hover:text-primary transition-colors duration-base cursor-pointer disabled:opacity-50"
          >
            {saved[size] ? 'Saved' : 'Save'}
          </button>
        </div>
      ))}
      {error && <p className="text-body-sm text-destructive">{error}</p>}
    </div>
  );
}
