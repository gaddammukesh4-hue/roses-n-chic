'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { AddressState } from '@/lib/address-types';

export async function addAddress(_prev: AddressState, formData: FormData): Promise<AddressState> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { status: 'error', message: 'Sign in to save an address.' };

  const fullName = String(formData.get('full_name') ?? '').trim();
  const line1 = String(formData.get('line1') ?? '').trim();
  const line2 = String(formData.get('line2') ?? '').trim();
  const city = String(formData.get('city') ?? '').trim();
  const state = String(formData.get('state') ?? '').trim();
  const postalCode = String(formData.get('postal_code') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();

  if (!fullName || !line1 || !city || !state || !postalCode) {
    return { status: 'error', message: 'Fill in name, address line 1, city, state, and postal code.' };
  }

  // RLS (addresses_insert_own) enforces user_id = auth.uid() independently
  // of this -- same belt-and-suspenders pattern as measurements.
  const { error } = await supabase.from('addresses').insert({
    user_id: userData.user.id,
    full_name: fullName,
    line1,
    line2: line2 || null,
    city,
    state,
    postal_code: postalCode,
    phone: phone || null,
  });
  if (error) return { status: 'error', message: error.message };

  revalidatePath('/account');
  revalidatePath('/checkout');
  return { status: 'success' };
}

export async function deleteAddress(id: string) {
  const supabase = await createClient();
  await supabase.from('addresses').delete().eq('id', id);
  revalidatePath('/account');
  revalidatePath('/checkout');
}
