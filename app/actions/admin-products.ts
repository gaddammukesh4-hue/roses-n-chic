'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin, logAdminAction } from '@/lib/admin-guard';
import { FABRICS, SIZES, type Fabric, type Size } from '@/lib/catalog-types';
import type { AdminActionState } from '@/lib/admin-types';

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function toMinorUnits(raw: FormDataEntryValue | null): number {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export async function createProduct(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  let supabase, userId;
  try {
    ({ supabase, userId } = await requireAdmin());
  } catch (e) {
    return { status: 'error', message: (e as Error).message };
  }

  const name = String(formData.get('name') ?? '').trim();
  const fabric = String(formData.get('fabric') ?? '');
  if (!name) return { status: 'error', message: 'Name is required.' };
  if (!FABRICS.includes(fabric as Fabric)) return { status: 'error', message: 'Invalid fabric.' };

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      slug: slugify(name),
      name,
      description: String(formData.get('description') ?? '') || null,
      fabric,
      fabric_notes: String(formData.get('fabric_notes') ?? '') || null,
      care_notes: String(formData.get('care_notes') ?? '') || null,
      price_inr: toMinorUnits(formData.get('price_inr')),
      price_usd: toMinorUnits(formData.get('price_usd')),
      status: 'draft',
    })
    .select('id')
    .single();
  if (error) return { status: 'error', message: error.message };

  await logAdminAction(supabase, userId, 'create_product', 'products', product.id, { name });
  revalidatePath('/admin/products');
  // Straight to the edit page -- that's where photos, video, and sizes
  // actually live. Staying on this bare-details page after creation was
  // confusing (looked like there was no way to add media at all).
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(productId: string, _prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  let supabase, userId;
  try {
    ({ supabase, userId } = await requireAdmin());
  } catch (e) {
    return { status: 'error', message: (e as Error).message };
  }

  const name = String(formData.get('name') ?? '').trim();
  const fabric = String(formData.get('fabric') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!name) return { status: 'error', message: 'Name is required.' };
  if (!FABRICS.includes(fabric as Fabric)) return { status: 'error', message: 'Invalid fabric.' };
  if (!['draft', 'active', 'archived'].includes(status)) return { status: 'error', message: 'Invalid status.' };

  const { error } = await supabase
    .from('products')
    .update({
      name,
      description: String(formData.get('description') ?? '') || null,
      fabric,
      fabric_notes: String(formData.get('fabric_notes') ?? '') || null,
      care_notes: String(formData.get('care_notes') ?? '') || null,
      price_inr: toMinorUnits(formData.get('price_inr')),
      price_usd: toMinorUnits(formData.get('price_usd')),
      status,
    })
    .eq('id', productId);
  if (error) return { status: 'error', message: error.message };

  await logAdminAction(supabase, userId, 'update_product', 'products', productId, { name, status });
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/collections');
  return { status: 'success' };
}

export async function upsertVariant(productId: string, size: string, stockCount: number): Promise<{ error?: string }> {
  let supabase, userId;
  try {
    ({ supabase, userId } = await requireAdmin());
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (!SIZES.includes(size as Size)) return { error: 'Invalid size.' };
  if (!Number.isInteger(stockCount) || stockCount < 0) return { error: 'Stock must be a non-negative whole number.' };

  const { error } = await supabase
    .from('product_variants')
    .upsert({ product_id: productId, size, stock_count: stockCount }, { onConflict: 'product_id,size' });
  if (error) return { error: error.message };

  await logAdminAction(supabase, userId, 'upsert_variant', 'product_variants', productId, { size, stockCount });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/collections');
  return {};
}

/** Signed upload URL so the browser uploads the image file directly to
 * Storage, not through this server (plan.md: "Use signed upload links for
 * media"). File type/size are enforced by the bucket's own config
 * (product-media: jpeg/png/webp/mp4/webm/quicktime, 50MB max -- the
 * project plan's Storage cap), not re-validated here since Storage
 * rejects anything outside that itself. */
export async function getProductImageUploadUrl(productId: string, filename: string): Promise<{ error?: string; path?: string; token?: string }> {
  let supabase;
  try {
    ({ supabase } = await requireAdmin());
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return { error: 'Invalid filename.' };

  const path = `${productId}/${Date.now()}-${filename}`;
  const { data, error } = await supabase.storage.from('product-media').createSignedUploadUrl(path);
  if (error) return { error: error.message };

  return { path: data.path, token: data.token };
}

export async function registerProductImage(productId: string, path: string, sortOrder: number): Promise<{ error?: string }> {
  let supabase, userId;
  try {
    ({ supabase, userId } = await requireAdmin());
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { data: pub } = supabase.storage.from('product-media').getPublicUrl(path);
  const { error } = await supabase.from('product_media').insert({ product_id: productId, image_url: pub.publicUrl, sort_order: sortOrder });
  if (error) return { error: error.message };

  await logAdminAction(supabase, userId, 'upload_product_image', 'product_media', productId, { path });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/collections');
  return {};
}

export async function deleteProductImage(mediaId: string, productId: string): Promise<{ error?: string }> {
  let supabase, userId;
  try {
    ({ supabase, userId } = await requireAdmin());
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabase.from('product_media').delete().eq('id', mediaId);
  if (error) return { error: error.message };

  await logAdminAction(supabase, userId, 'delete_product_image', 'product_media', mediaId, {});
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/collections');
  return {};
}

/** Same signed-upload pattern as getProductImageUploadUrl, for the reel
 * video file. Type/size are enforced by the bucket's own config
 * (product-media now also allows video/mp4, video/webm, video/quicktime,
 * up to 50MB -- the project plan's own Storage upload cap, not a number
 * chosen here). After a successful upload, the caller passes the
 * resulting public URL to the existing updateReelUrl action -- the DB
 * doesn't distinguish an uploaded file's URL from a pasted external one,
 * so no separate "register" action is needed. */
export async function getProductVideoUploadUrl(productId: string, filename: string): Promise<{ error?: string; path?: string; token?: string }> {
  let supabase;
  try {
    ({ supabase } = await requireAdmin());
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return { error: 'Invalid filename.' };

  const path = `${productId}/reel-${Date.now()}-${filename}`;
  const { data, error } = await supabase.storage.from('product-media').createSignedUploadUrl(path);
  if (error) return { error: error.message };

  return { path: data.path, token: data.token };
}

export async function updateReelUrl(productId: string, reelUrl: string): Promise<{ error?: string }> {
  let supabase, userId;
  try {
    ({ supabase, userId } = await requireAdmin());
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { data: existing } = await supabase.from('product_media').select('id').eq('product_id', productId).not('reel_video_url', 'is', null).maybeSingle();
  if (existing) {
    const { error } = await supabase.from('product_media').update({ reel_video_url: reelUrl || null }).eq('id', existing.id);
    if (error) return { error: error.message };
  } else if (reelUrl) {
    const { error } = await supabase.from('product_media').insert({ product_id: productId, reel_video_url: reelUrl, sort_order: 999 });
    if (error) return { error: error.message };
  }

  await logAdminAction(supabase, userId, 'update_reel_url', 'product_media', productId, { reelUrl });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/collections');
  return {};
}
