'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { readGuestCart, writeGuestCart, clearGuestCart } from '@/lib/cart-storage';
import { getCart, addToCart, updateCartItemQuantity, mergeGuestCart } from '@/app/actions/cart';
import type { CartItem } from '@/lib/cart-types';

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  loading: boolean;
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  /** Call right after a sign-in/sign-up succeeds: merges any guest-cart
   * items into the user's DB cart and switches to reading from there. Not
   * automatic -- the browser Supabase client's onAuthStateChange does not
   * fire for a sign-in that happened via a Server Action (a different,
   * cookie-based client instance), so the caller must invoke this itself
   * at the moment it knows sign-in succeeded (see AuthDrawer). */
  syncAfterSignIn: () => Promise<void>;
  /** Call right after sign-out: switches back to reading the guest cart. */
  syncAfterSignOut: () => void;
  /** Call right after a successful checkout: the server already cleared
   * the DB cart (app/actions/checkout.ts confirmPayment), this just
   * re-fetches so the client reflects that. */
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    // On first mount (including a fresh page load after sign-in elsewhere),
    // the browser client's session IS correctly hydrated from the same
    // cookies the server reads -- @supabase/ssr's whole point is keeping
    // server and browser clients in sync via cookies. It's only *live*
    // transitions within an already-mounted session that need the explicit
    // syncAfterSignIn/Out calls below.
    async function loadInitial() {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const isSignedIn = Boolean(data.session);
      setSignedIn(isSignedIn);
      setItems(isSignedIn ? await getCart() : readGuestCart());
      setLoading(false);
    }
    loadInitial();
  }, []);

  async function addItem(item: Omit<CartItem, 'id' | 'quantity'>, quantity = 1) {
    if (signedIn) {
      const result = await addToCart(item.variantId, quantity);
      if (!result.error) setItems(await getCart());
      return;
    }
    const current = readGuestCart();
    const existing = current.find((i) => i.variantId === item.variantId);
    const next = existing
      ? current.map((i) => (i.variantId === item.variantId ? { ...i, quantity: i.quantity + quantity } : i))
      : [...current, { ...item, id: crypto.randomUUID(), quantity }];
    writeGuestCart(next);
    setItems(next);
  }

  async function updateQuantity(id: string, quantity: number) {
    if (signedIn) {
      await updateCartItemQuantity(id, quantity);
      setItems(await getCart());
      return;
    }
    const current = readGuestCart();
    const next = quantity <= 0 ? current.filter((i) => i.id !== id) : current.map((i) => (i.id === id ? { ...i, quantity } : i));
    writeGuestCart(next);
    setItems(next);
  }

  async function removeItem(id: string) {
    await updateQuantity(id, 0);
  }

  async function syncAfterSignIn() {
    const guestItems = readGuestCart();
    if (guestItems.length > 0) {
      await mergeGuestCart(guestItems.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
      clearGuestCart();
    }
    setSignedIn(true);
    setItems(await getCart());
  }

  function syncAfterSignOut() {
    setSignedIn(false);
    setItems(readGuestCart());
  }

  async function refresh() {
    setItems(signedIn ? await getCart() : readGuestCart());
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, loading, addItem, updateQuantity, removeItem, syncAfterSignIn, syncAfterSignOut, refresh }}>
      {children}
    </CartContext.Provider>
  );
}
