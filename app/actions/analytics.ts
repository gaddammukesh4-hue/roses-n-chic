'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const viewSchema = z.object({
  path: z.string().trim().max(300).startsWith('/'),
  referrer: z.string().trim().max(300).nullable().optional(),
});

/** Fire-and-forget page-view log (components/PageViewBeacon.tsx). Never
 * throws -- a logging failure must not break navigation. If the visitor is
 * signed in, the view is linked to their account (own-marketing-use only,
 * per the Privacy policy's Cookies/What-we-collect sections) -- taken from
 * the server-side session, never from client input, so it can't be
 * spoofed to another user's id. Signed-out visits stay fully anonymous. */
export async function logPageView(path: string, referrer: string | null): Promise<void> {
  const parsed = viewSchema.safeParse({ path, referrer });
  if (!parsed.success) return;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from('page_views').insert({
    path: parsed.data.path,
    referrer: parsed.data.referrer ?? null,
    user_id: userData.user?.id ?? null,
  });
  if (error) console.error('Failed to log page view:', error.message);
}
