'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, logAdminAction } from '@/lib/admin-guard';

const ORDER_STATUSES = ['pending', 'paid', 'failed', 'refunded', 'cancelled', 'fulfilled'] as const;

export async function updateOrderStatus(orderId: string, status: string): Promise<{ error?: string }> {
  let supabase, userId;
  try {
    ({ supabase, userId } = await requireAdmin());
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) return { error: 'Invalid status.' };

  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) return { error: error.message };

  await logAdminAction(supabase, userId, 'update_order_status', 'orders', orderId, { status });
  revalidatePath('/admin/orders');
  return {};
}

export async function setTrackingNumber(orderId: string, trackingNumber: string): Promise<{ error?: string }> {
  let supabase, userId;
  try {
    ({ supabase, userId } = await requireAdmin());
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabase.from('orders').update({ tracking_number: trackingNumber || null }).eq('id', orderId);
  if (error) return { error: error.message };

  await logAdminAction(supabase, userId, 'set_tracking_number', 'orders', orderId, { trackingNumber });
  revalidatePath('/admin/orders');
  return {};
}
