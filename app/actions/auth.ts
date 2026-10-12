'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

import type { AuthState } from '@/lib/auth-types';

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { status: 'error', message: 'Enter your email and password.' };

  // plan.md Part C: rate limit sign-in attempts (brute-force protection).
  const allowed = await checkRateLimit('signin', 10, 5 * 60);
  if (!allowed) return { status: 'error', message: 'Too many attempts. Try again in a few minutes.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: 'error', message: error.message };

  revalidatePath('/', 'layout');
  return { status: 'success' };
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  if (!email || !password) return { status: 'error', message: 'Enter your email and password.' };
  if (password.length < 8) return { status: 'error', message: 'Password must be at least 8 characters.' };

  const allowed = await checkRateLimit('signup', 5, 60 * 60);
  if (!allowed) return { status: 'error', message: 'Too many attempts. Try again later.' };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: name || null, phone: phone || null } },
  });
  if (error) return { status: 'error', message: error.message };

  revalidatePath('/', 'layout');
  // A new project requires email confirmation by default -- data.session is
  // null until the user clicks the link, so tell them that rather than
  // implying they're signed in.
  if (!data.session) {
    return { status: 'success', message: 'Check your email to confirm your account.' };
  }
  return { status: 'success' };
}

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { status: 'error', message: 'Enter your email.' };

  const allowed = await checkRateLimit('password-reset', 3, 60 * 60);
  if (!allowed) return { status: 'error', message: 'Too many attempts. Try again later.' };

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/account/reset-password`,
  });
  if (error) return { status: 'error', message: error.message };

  return { status: 'success', message: 'Check your email for a reset link.' };
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get('password') ?? '');
  if (password.length < 8) return { status: 'error', message: 'Password must be at least 8 characters.' };

  const supabase = await createClient();
  // Relies on the recovery session the /auth/callback route just established
  // from the emailed link -- if there's no session, this fails as "not
  // authenticated" rather than silently doing nothing.
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { status: 'error', message: error.message };

  return { status: 'success', message: 'Password updated. You can sign in with it now.' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
}
