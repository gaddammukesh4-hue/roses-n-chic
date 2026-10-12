'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FABRICS, SIZES } from '@/lib/catalog-types';

const PRICE_RANGES = [
  { value: 'under-4000', label: 'Under ₹4,000' },
  { value: '4000-7000', label: '₹4,000 – ₹7,000' },
  { value: 'over-7000', label: 'Over ₹7,000' },
] as const;

/** Price buckets are always in INR, independent of the INR/USD display toggle
 * -- keeping one reference currency for filtering avoids a second, redundant
 * set of USD buckets for what is still a primarily India-based catalog. */
export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/collections${params.toString() ? `?${params}` : ''}`);
  }

  const selectClass =
    'rounded-sm border border-border bg-card px-3 py-2 text-body-sm text-primary cursor-pointer';

  return (
    <div className="flex flex-wrap gap-3" role="group" aria-label="Filter products">
      <select
        className={selectClass}
        value={searchParams.get('fabric') ?? ''}
        onChange={(e) => update('fabric', e.target.value)}
        aria-label="Fabric"
      >
        <option value="">All fabrics</option>
        {FABRICS.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={searchParams.get('size') ?? ''}
        onChange={(e) => update('size', e.target.value)}
        aria-label="Size"
      >
        <option value="">All sizes</option>
        {SIZES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={searchParams.get('price') ?? ''}
        onChange={(e) => update('price', e.target.value)}
        aria-label="Price"
      >
        <option value="">Any price</option>
        {PRICE_RANGES.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
    </div>
  );
}
