import type { CartItem } from '@/lib/cart-types';

const KEY = 'rnc_guest_cart';

/** Guest cart lives entirely in localStorage (plan.md Phase 7: "Store the
 * cart in the database for signed-in users. Store it in local storage for
 * guests."). Wrapped in try/catch -- localStorage can throw in private
 * browsing or when blocked, and a cart feature failing silently beats the
 * whole page crashing over it. */
export function readGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeGuestCart(items: CartItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Ignore -- see readGuestCart.
  }
}

export function clearGuestCart(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Ignore.
  }
}
