'use server';

import crypto from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRazorpayClient } from '@/lib/razorpay';
import { getCart } from '@/app/actions/cart';
import { checkRateLimit } from '@/lib/rate-limit';

export type CreateOrderResult =
  | { error: string }
  | { orderId: string; razorpayOrderId: string; amount: number; currency: 'INR'; keyId: string };

/**
 * Creates the order and the Razorpay order together, server-side, with
 * prices and stock re-read fresh from the database -- never trusts
 * anything the client sent about what's in the cart or what it costs
 * (plan.md: "The server sets all prices"). Uses the service-role client
 * because orders/order_items have no insert policy for authenticated
 * users at all (Phase 4 RLS) -- this function *is* "the server" that's
 * allowed to write them, not a bypass of that rule.
 */
export async function createOrder(): Promise<CreateOrderResult> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: 'Sign in to check out.' };

  const allowed = await checkRateLimit('checkout', 20, 60 * 60);
  if (!allowed) return { error: 'Too many checkout attempts. Try again later.' };

  const items = await getCart();
  if (items.length === 0) return { error: 'Your bag is empty.' };

  for (const item of items) {
    if (item.quantity > item.stockCount) {
      return { error: `Only ${item.stockCount} left of ${item.productName} (${item.size}).` };
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.priceInr * i.quantity, 0);
  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({ user_id: userData.user.id, currency: 'INR', subtotal, total: subtotal, payment_provider: 'razorpay' })
    .select('id')
    .single();
  if (orderError) return { error: orderError.message };

  const { error: itemsError } = await admin.from('order_items').insert(
    items.map((item) => ({
      order_id: order.id,
      product_variant_id: item.variantId,
      product_name: item.productName,
      size: item.size,
      unit_price: item.priceInr,
      quantity: item.quantity,
    })),
  );
  if (itemsError) return { error: itemsError.message };

  const razorpay = getRazorpayClient();
  const razorpayOrder = await razorpay.orders.create({
    amount: subtotal,
    currency: 'INR',
    receipt: order.id,
  });

  await admin.from('orders').update({ payment_id: razorpayOrder.id }).eq('id', order.id);

  return { orderId: order.id, razorpayOrderId: razorpayOrder.id, amount: subtotal, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID! };
}

export type ConfirmPaymentResult = { success: boolean; error?: string };

/**
 * Fast-path confirmation, called right after the Checkout widget's success
 * callback. The webhook (app/api/webhooks/razorpay/route.ts) is the
 * authoritative confirmation -- this exists so the user sees "paid"
 * immediately instead of waiting on a webhook round trip, not as a
 * replacement for it. Both call the same idempotent fulfill_order RPC, so
 * whichever arrives first wins and the other is a safe no-op.
 */
export async function confirmPayment(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): Promise<ConfirmPaymentResult> {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  // timingSafeEqual requires equal-length buffers -- a length mismatch
  // means "not equal", not a crash.
  const sigBuf = Buffer.from(razorpaySignature);
  const expectedBuf = Buffer.from(expected);
  const valid = sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  if (!valid) return { success: false, error: 'Signature verification failed.' };

  const admin = createAdminClient();
  const { error: rpcError } = await admin.rpc('fulfill_order', { p_order_id: orderId });
  if (rpcError) return { success: false, error: rpcError.message };

  await admin.from('orders').update({ payment_id: razorpayPaymentId }).eq('id', orderId);

  // Order placed -- empty the cart. Uses the regular (RLS-bound) client
  // since this really is "the signed-in user's own cart being cleared,"
  // not an admin operation.
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    const { data: cart } = await supabase.from('carts').select('id').eq('user_id', userData.user.id).maybeSingle();
    if (cart) await supabase.from('cart_items').delete().eq('cart_id', cart.id);
  }

  return { success: true };
}
