'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { formatPrice } from '@/lib/catalog-types';
import CheckoutButton from '@/components/CheckoutButton';

export default function CheckoutCart() {
  const { items, refresh } = useCart();
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
      <CheckoutButton onSuccess={refresh} />
    </>
  );
}
