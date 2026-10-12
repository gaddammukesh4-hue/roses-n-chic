'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { AuthState } from '@/lib/auth-types';

export async function addMeasurement(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { status: 'error', message: 'Sign in to save measurements.' };

  const label = String(formData.get('label') ?? 'My measurements').trim() || 'My measurements';
  const fields = ['bust_cm', 'waist_cm', 'hip_cm', 'height_cm'] as const;
  const data: Record<string, number> = {};
  for (const field of fields) {
    const raw = formData.get(field);
    const value = raw ? Number(raw) : NaN;
    if (!Number.isFinite(value) || value <= 0) return { status: 'error', message: 'Enter valid measurements in cm.' };
    data[field] = value;
  }

  // RLS (measurements_insert_own) enforces user_id = auth.uid() independently
  // of this -- setting it explicitly here is belt-and-suspenders, not the
  // actual security boundary.
  const { error } = await supabase.from('measurements').insert({ user_id: userData.user.id, label, data });
  if (error) return { status: 'error', message: error.message };

  revalidatePath('/account');
  return { status: 'success' };
}

export async function deleteMeasurement(id: string) {
  const supabase = await createClient();
  await supabase.from('measurements').delete().eq('id', id);
  revalidatePath('/account');
}
