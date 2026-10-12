import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * The authoritative payment confirmation (plan.md Phase 7: "Only the
 * webhook or the verified signature can set an order to paid"). The
 * client-side confirmPayment() in app/actions/checkout.ts is a fast-path
 * for immediate UX feedback; this is what's actually trustworthy, since
 * a user can close the tab right after paying and never trigger that path.
 *
 * Idempotency: event_id is a hash of the raw body, not something Razorpay
 * guarantees as a header -- a retried delivery has byte-identical content,
 * so it hashes to the same key and the unique(provider, event_id)
 * constraint on payment_events rejects the duplicate insert. Both this
 * route and confirmPayment() call the same idempotent fulfill_order RPC,
 * so whichever arrives first wins; the other is a safe no-op.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  const valid = sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let body: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventId = crypto.createHash('sha256').update(rawBody).digest('hex');
  const admin = createAdminClient();

  const { error: insertError } = await admin
    .from('payment_events')
    .insert({ provider: 'razorpay', event_id: eventId, payload: body });

  if (insertError) {
    // Unique violation on (provider, event_id) = we've already processed
    // this exact event -- acknowledge and stop, not an error.
    if (insertError.code === '23505') return NextResponse.json({ ok: true, duplicate: true });
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const razorpayOrderId = body.payload?.payment?.entity?.order_id;
  if (!razorpayOrderId) return NextResponse.json({ ok: true, note: 'No order reference in payload' });

  const { data: order } = await admin.from('orders').select('id, status').eq('payment_id', razorpayOrderId).maybeSingle();
  if (!order) return NextResponse.json({ ok: true, note: 'No matching order' });

  if (body.event === 'payment.captured' || body.event === 'order.paid') {
    const { error: rpcError } = await admin.rpc('fulfill_order', { p_order_id: order.id });
    await admin.from('payment_events').update({ processed_at: new Date().toISOString(), order_id: order.id }).eq('event_id', eventId);
    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });
  } else if (body.event === 'payment.failed' && order.status === 'pending') {
    await admin.from('orders').update({ status: 'failed' }).eq('id', order.id);
    await admin.from('payment_events').update({ processed_at: new Date().toISOString(), order_id: order.id }).eq('event_id', eventId);
  }

  return NextResponse.json({ ok: true });
}
