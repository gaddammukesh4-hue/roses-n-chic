'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import type { AuthState } from '@/lib/auth-types';

const emailSchema = z.string().trim().toLowerCase().email().max(254);

export async function subscribeNewsletter(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) return { status: 'error', message: 'Enter a valid email address.' };

  const allowed = await checkRateLimit('newsletter', 5, 60 * 60);
  if (!allowed) return { status: 'error', message: 'Too many attempts. Try again later.' };

  const supabase = await createClient();
  const { error } = await supabase.from('newsletter_subscribers').insert({ email: parsed.data });

  // 23505 = unique_violation -- already subscribed is a success from the
  // visitor's point of view, not an error to show them.
  if (error && error.code !== '23505') return { status: 'error', message: 'Something went wrong. Try again.' };

  return { status: 'success' };
}
