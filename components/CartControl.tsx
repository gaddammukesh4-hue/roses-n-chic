'use client';

import { useState } from 'react';
import CartDrawer from '@/components/CartDrawer';
import { useCart } from '@/components/CartProvider';
import type { Currency } from '@/lib/catalog-types';

export default function CartControl({ currency }: { currency: Currency }) {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="cursor-pointer">
        Bag ({itemCount})
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} currency={currency} />
    </>
  );
}
