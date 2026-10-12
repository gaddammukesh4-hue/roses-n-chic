'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { formatPrice, type Currency } from '@/lib/catalog-types';
import ClientPortal from '@/components/ClientPortal';

export default function CartDrawer({ open, onClose, currency }: { open: boolean; onClose: () => void; currency: Currency }) {
  const { items, loading, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const subtotal = items.reduce((sum, i) => sum + (currency === 'INR' ? i.priceInr : i.priceUsd) * i.quantity, 0);

  return (
    <ClientPortal>
    <div
      aria-hidden={!open}
      inert={!open}
      className={`fixed inset-0 z-[60] transition-opacity duration-base ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-rose-ink/30 cursor-pointer" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bag"
        className={`absolute right-0 top-0 h-full w-full max-w-md flex flex-col p-8 overflow-y-auto border-l border-border shadow-lg transition-transform duration-base ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'var(--glass-drawer-bg)', backdropFilter: 'blur(var(--glass-drawer-blur))', WebkitBackdropFilter: 'blur(var(--glass-drawer-blur))' }}
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-6 top-6 text-h3 leading-none cursor-pointer">
          &times;
        </button>

        <h2 className="text-h2 pt-12 mb-6">Bag</h2>

        {loading ? (
          <p className="text-body-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">Your bag is empty.</p>
        ) : (
          <>
            <ul className="space-y-4 flex-1">
              {items.map((item) => (
                <li key={item.id} className="rounded-md border border-border bg-card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-body-sm font-medium">{item.productName}</p>
                      <p className="text-caption text-muted-foreground">Size {item.size}</p>
                    </div>
                    <p className="text-body-sm">{formatPrice((currency === 'INR' ? item.priceInr : item.priceUsd) * item.quantity, currency)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-border" role="group" aria-label={`Quantity for ${item.productName}`}>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 cursor-pointer" aria-label="Decrease quantity">−</button>
                      <span className="w-8 text-center text-body-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stockCount}
                        className="w-8 h-8 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button type="button" onClick={() => removeItem(item.id)} className="text-body-sm text-muted-foreground hover:text-destructive transition-colors duration-base cursor-pointer">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="pt-6 mt-6 border-t border-border space-y-4">
              <div className="flex items-center justify-between text-body-lg">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block text-center rounded-none bg-primary text-on-primary px-11 py-[15px] text-body-sm uppercase tracking-[0.14em] transition-colors duration-base hover:bg-secondary"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
    </ClientPortal>
  );
}
