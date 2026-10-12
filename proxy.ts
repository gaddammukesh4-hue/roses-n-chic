import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session cookie on every request, per the
 * @supabase/ssr Next.js App Router pattern (Next.js 16 renamed this
 * file/export from "middleware" to "proxy"). Required once Phase 6
 * (Accounts) adds sign-in -- harmless no-op until then (no session cookie
 * exists yet, and the guard below also no-ops until Supabase env vars exist).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // No-op until a real Supabase project is linked (Phase 0/4) -- without
  // this guard every request 500s the moment this file exists, since the
  // client throws on a missing URL.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif)$).*)'],
};
