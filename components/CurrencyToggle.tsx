'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setCurrency } from '@/app/actions/currency';
import type { Currency } from '@/lib/catalog-types';

export default function CurrencyToggle({ currency }: { currency: Currency }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Currency) {
    if (next === currency || pending) return;
    startTransition(async () => {
      await setCurrency(next);
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card p-1 text-body-sm" role="group" aria-label="Currency">
      {(['INR', 'USD'] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => choose(c)}
          aria-pressed={currency === c}
          disabled={pending}
          className={`rounded-full px-3 py-1 transition-colors duration-base cursor-pointer disabled:cursor-wait ${
            currency === c ? 'bg-primary text-on-primary' : 'text-muted-foreground hover:text-primary'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
