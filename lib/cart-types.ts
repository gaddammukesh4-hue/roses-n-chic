/** Pure types -- no server imports, safe for Client Components. */

export type CartItem = {
  /** cart_items.id for a signed-in cart row; a client-generated id for a
   * guest localStorage item (never sent to the server -- addToCart always
   * looks the row up by variantId server-side). */
  id: string;
  variantId: string;
  productSlug: string;
  productName: string;
  size: string;
  priceInr: number;
  priceUsd: number;
  quantity: number;
  /** Live stock at the time the cart was last loaded -- used to cap the
   * quantity stepper client-side; the real check happens again at checkout. */
  stockCount: number;
};
