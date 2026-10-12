import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * Resolves the signed-in admin user, or throws. Every admin server action
 * calls this first and uses the returned (RLS-bound, non-service-role)
 * client for its actual writes -- the point is that RLS's own
 * `products_admin_insert` etc. policies are the real authorization check,
 * not just this function. This function existing is about giving a clear
 * error instead of a confusing RLS-denial for a non-admin, not about being
 * the security boundary itself.
 */
export async function requireAdmin(): Promise<{ supabase: SupabaseClient; userId: string }> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not signed in.');

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', userData.user.id).maybeSingle();
  if (!profile?.is_admin) throw new Error('Admin access required.');

  return { supabase, userId: userData.user.id };
}

/** plan.md Phase 8: "Log all admin actions." Best-effort -- a logging
 * failure shouldn't block the actual admin action from completing. */
export async function logAdminAction(
  supabase: SupabaseClient,
  adminId: string,
  action: string,
  targetTable: string,
  targetId: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabase.from('admin_audit_log').insert({ admin_id: adminId, action, target_table: targetTable, target_id: targetId, metadata });
  if (error) console.error('Failed to log admin action:', error.message);
}
