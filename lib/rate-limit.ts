import 'server-only';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

/** Best guess at the caller's IP from standard proxy headers (Vercel/most
 * hosts set x-forwarded-for). Falls back to a shared bucket in local dev,
 * where there's no proxy in front of the server to set it. */
async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return h.get('x-real-ip') ?? 'unknown';
}

/**
 * plan.md Part C: "Rate limits on sign-in, sign-up, password reset, and
 * checkout." Returns true if the action is allowed, false if the caller has
 * hit the limit. Fails open (allows the action) if the rate-limit check
 * itself errors -- a database hiccup here should not be able to lock every
 * visitor out of signing in.
 */
export async function checkRateLimit(action: string, limit: number, windowSeconds: number): Promise<boolean> {
  const ip = await getClientIp();
  const bucket = `${action}:${ip}`;
  const admin = createAdminClient();
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count, error: countError } = await admin
    .from('rate_limit_hits')
    .select('*', { count: 'exact', head: true })
    .eq('bucket', bucket)
    .gte('created_at', since);
  if (countError) return true;

  if ((count ?? 0) >= limit) return false;

  await admin.from('rate_limit_hits').insert({ bucket });
  return true;
}
