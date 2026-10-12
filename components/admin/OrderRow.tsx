'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatus, setTrackingNumber } from '@/app/actions/admin-orders';
import { formatPrice } from '@/lib/catalog-types';

const STATUSES = ['pending', 'paid', 'failed', 'refunded', 'cancelled', 'fulfilled'] as const;

type Order = {
  id: string;
  status: string;
  total: number;
  currency: 'INR' | 'USD';
  tracking_number: string | null;
  created_at: string;
  order_items: { product_name: string; size: string; quantity: number }[];
};

export default function OrderRow({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.tracking_number ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleStatusChange(next: string) {
    setStatus(next);
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, next);
      if (result.error) setError(result.error);
    });
  }

  function handleTrackingSave() {
    startTransition(async () => {
      const result = await setTrackingNumber(order.id, tracking);
      if (result.error) setError(result.error);
    });
  }

  return (
    <tr className="border-t border-border align-top">
      <td className="px-4 py-3 text-caption text-muted-foreground">{order.id.slice(0, 8)}</td>
      <td className="px-4 py-3 text-body-sm">
        {order.order_items.map((i) => `${i.product_name} (${i.size}) × ${i.quantity}`).join(', ')}
      </td>
      <td className="px-4 py-3 text-body-sm">{formatPrice(order.total, order.currency)}</td>
      <td className="px-4 py-3">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={pending}
          className="rounded-sm border border-border bg-card px-2 py-1 text-body-sm capitalize"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Tracking #"
            className="w-32 rounded-sm border border-border bg-card px-2 py-1 text-body-sm"
          />
          <button type="button" onClick={handleTrackingSave} disabled={pending} className="text-body-sm text-secondary hover:text-primary transition-colors duration-base cursor-pointer disabled:opacity-50">
            Save
          </button>
        </div>
        {error && <p className="text-caption text-destructive mt-1">{error}</p>}
      </td>
    </tr>
  );
}
