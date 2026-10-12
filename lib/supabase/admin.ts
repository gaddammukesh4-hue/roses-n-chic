import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role client. BYPASSES Row Level Security entirely -- this is the
 * only thing allowed to write orders, order_items, and payment_events
 * (plan.md: "Only the server can write orders and payments", "Never put
 * secret keys in browser code"). The `server-only` import makes any
 * accidental Client Component import of this file fail at build time.
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix -- it must never
 * reach the browser bundle) set in the server's environment.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
