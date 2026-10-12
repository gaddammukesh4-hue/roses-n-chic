'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { CartItem } from '@/lib/cart-types';

type CartItemRow = {
  id: string;
  quantity: number;
  product_variants: {
    id: string;
    size: string;
    stock_count: number;
    products: { slug: string; name: string; price_inr: number; price_usd: number } | null;
  } | null;
};

function toCartItem(row: CartItemRow): CartItem | null {
  const variant = row.product_variants;
  const product = variant?.products;
  if (!variant || !product) return null;
  return {
    id: row.id,
    variantId: variant.id,
    productSlug: product.slug,
    productName: product.name,
    size: variant.size,
    priceInr: product.price_inr,
    priceUsd: product.price_usd,
    quantity: row.quantity,
    stockCount: variant.stock_count,
  };
}

/** Finds the signed-in user's cart row, creating one if this is their first item. */
async function getOrCreateCartId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<string> {
  const { data: existing } = await supabase.from('carts').select('id').eq('user_id', userId).maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase.from('carts').insert({ user_id: userId }).select('id').single();
  if (error) throw new Error(`Failed to create cart: ${error.message}`);
  return created.id;
}

export async function getCart(): Promise<CartItem[]> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data: cart } = await supabase.from('carts').select('id').eq('user_id', userData.user.id).maybeSingle();
  if (!cart) return [];

  const { data: rows, error } = await supabase
    .from('cart_items')
    .select('id, quantity, product_variants(id, size, stock_count, products(slug, name, price_inr, price_usd))')
    .eq('cart_id', cart.id);
  if (error) throw new Error(`Failed to load cart: ${error.message}`);

  return ((rows ?? []) as unknown as CartItemRow[]).map(toCartItem).filter((item): item is CartItem => item !== null);
}

export async function addToCart(variantId: string, quantity: number = 1): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: 'not-signed-in' };

  const cartId = await getOrCreateCartId(supabase, userData.user.id);

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_variant_id', variantId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('cart_items').insert({ cart_id: cartId, product_variant_id: variantId, quantity });
    if (error) return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return {};
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<void> {
  const supabase = await createClient();
  if (quantity <= 0) {
    await supabase.from('cart_items').delete().eq('id', itemId);
  } else {
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
  }
  revalidatePath('/', 'layout');
}

export async function removeCartItem(itemId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from('cart_items').delete().eq('id', itemId);
  revalidatePath('/', 'layout');
}

/** Called once right after sign-in/sign-up if the browser had a guest cart.
 * Merges by incrementing quantity for variants already in the user's cart. */
export async function mergeGuestCart(items: { variantId: string; quantity: number }[]): Promise<void> {
  if (items.length === 0) return;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const cartId = await getOrCreateCartId(supabase, userData.user.id);
  for (const item of items) {
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_variant_id', item.variantId)
      .maybeSingle();
    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + item.quantity }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({ cart_id: cartId, product_variant_id: item.variantId, quantity: item.quantity });
    }
  }
  revalidatePath('/', 'layout');
}
