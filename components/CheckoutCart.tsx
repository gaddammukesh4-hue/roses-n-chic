'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { formatPrice } from '@/lib/catalog-types';

export default function CheckoutCart() {
  const { items } = useCart();
  const subtotalInr = items.reduce((sum, i) => sum + i.priceInr * i.quantity, 0);

  if (items.length === 0) {
    return (
      <p className="text-body-sm text-muted-foreground">
        Your bag is empty. <Link href="/collections" className="text-secondary hover:text-primary transition-colors duration-base">Browse the collection</Link>.
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border rounded-md border border-border bg-card">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between px-4 py-3 text-body-sm">
            <span>{item.productName} · Size {item.size} × {item.quantity}</span>
            <span>{formatPrice(item.priceInr * item.quantity, 'INR')}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between text-h3">
        <span>Subtotal</span>
        <span>{formatPrice(subtotalInr, 'INR')}</span>
      </div>
      <div className="rounded-md border border-border bg-card p-6 text-body-sm text-muted-foreground">
        Payment is being set up. This page will let you pay by card, UPI, or net banking once it&apos;s ready.
      </div>
    </>
  );
}
