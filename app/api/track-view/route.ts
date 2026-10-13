import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const viewSchema = z.object({
  path: z.string().trim().max(300).startsWith('/'),
  referrer: z.string().trim().max(300).nullable().optional(),
});

/**
 * Page-view logging as a Route Handler, called via an explicit fetch()
 * from the client (components/PageViewBeacon.tsx) rather than a plain
 * Server Action invoked from useEffect -- gives this one specific,
 * frequently-firing call explicit control over credentials rather than
 * relying on Next's action-dispatch machinery, which is reasonable
 * either way for a fire-and-forget beacon like this.
 *
 * If the visitor is signed in, the view is linked to their account
 * (own-marketing-use only, per the Privacy policy). Signed-out visits
 * stay fully anonymous -- no IP, no device identifier, no tracking cookie.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = viewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from('page_views').insert({
    path: parsed.data.path,
    referrer: parsed.data.referrer ?? null,
    user_id: userData.user?.id ?? null,
  });
  if (error) console.error('Failed to log page view:', error.message);

  return NextResponse.json({ ok: true });
}
