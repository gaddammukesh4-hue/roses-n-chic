import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Exchanges the one-time `code` Supabase Auth puts in email links (sign-up
 * confirmation, password recovery, and later Google OAuth) for a real
 * session. Every email-based or OAuth auth flow routes through here first.
 */
/** Only ever redirect to a same-site relative path -- `next` comes straight
 * from the URL query string, so without this check a crafted link could
 * point it at `//evil.com` or similar. The string-concatenation redirect
 * below (`${origin}${next}`) already keeps the origin fixed, which makes a
 * full absolute-URL payload harmless, but a leading `//` is still parsed
 * by some clients as protocol-relative -- reject anything that isn't a
 * single leading slash, explicitly. */
function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/?auth_error=1`);
}
