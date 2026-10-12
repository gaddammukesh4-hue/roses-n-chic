'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { formatPrice } from '@/lib/catalog-types';
import CheckoutButton from '@/components/CheckoutButton';
import AddressPicker from '@/components/AddressPicker';
import type { Address } from '@/lib/address-types';

export default function CheckoutCart({ addresses }: { addresses: Address[] }) {
  const { items, refresh } = useCart();
  const subtotalInr = items.reduce((sum, i) => sum + i.priceInr * i.quantity, 0);

  // A manual pick, once made, wins -- but if the address list changes (one
  // added or the previously picked one deleted) and that pick is no longer
  // valid, fall back to a sensible default. Derived during render instead
  // of synced via an effect -- no separate "resync" step needed.
  const [manualPick, setManualPick] = useState<string | null>(null);
  const selectedAddressId = (manualPick && addresses.some((a) => a.id === manualPick))
    ? manualPick
    : (addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? null);

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
      <AddressPicker addresses={addresses} selectedId={selectedAddressId} onSelect={setManualPick} />
      <CheckoutButton addressId={selectedAddressId} onSuccess={refresh} />
    </>
  );
}
