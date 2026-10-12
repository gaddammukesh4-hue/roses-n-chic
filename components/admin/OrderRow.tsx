'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatus, setTrackingNumber } from '@/app/actions/admin-orders';
import { formatPrice } from '@/lib/catalog-types';

const STATUSES = ['pending', 'paid', 'failed', 'refunded', 'cancelled', 'fulfilled'] as const;

type ShippingAddress = {
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
} | null;

type Order = {
  id: string;
  status: string;
  total: number;
  currency: 'INR' | 'USD';
  tracking_number: string | null;
  shipping_address: ShippingAddress;
  created_at: string;
  order_items: { product_name: string; size: string; quantity: number }[];
};

type Customer = { name: string | null; phone: string | null; email: string | null };

export default function OrderRow({ order, customer }: { order: Order; customer: Customer }) {
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
      <td className="px-4 py-3 text-caption text-muted-foreground">
        {order.id.slice(0, 8)}
        <br />
        {new Date(order.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-body-sm">
        {customer.name && <div className="font-medium">{customer.name}</div>}
        {customer.email && <div className="text-muted-foreground">{customer.email}</div>}
        {customer.phone && <div className="text-muted-foreground">{customer.phone}</div>}
        {!customer.name && !customer.email && !customer.phone && <span className="text-muted-foreground">—</span>}
      </td>
      <td className="px-4 py-3 text-body-sm">
        {order.shipping_address ? (
          <>
            <div>{order.shipping_address.full_name}</div>
            <div className="text-muted-foreground">
              {order.shipping_address.line1}{order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ''}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
            </div>
            {order.shipping_address.phone && <div className="text-muted-foreground">{order.shipping_address.phone}</div>}
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
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
