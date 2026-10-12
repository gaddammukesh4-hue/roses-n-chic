import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Exchanges the one-time `code` Supabase Auth puts in email links (sign-up
 * confirmation, password recovery, and later Google OAuth) for a real
 * session. Every email-based or OAuth auth flow routes through here first.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/?auth_error=1`);
}
