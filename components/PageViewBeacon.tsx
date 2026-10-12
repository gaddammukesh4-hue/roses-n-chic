'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { logPageView } from '@/app/actions/analytics';

/** Logs one page_views row per route change, site-wide (mounted once in
 * app/layout.tsx). No cookie, no visitor ID, no IP/user-agent capture --
 * see supabase/migrations/20261012000009_marketing.sql. */
export default function PageViewBeacon() {
  const pathname = usePathname();
  const lastLogged = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastLogged.current === pathname) return;
    lastLogged.current = pathname;
    logPageView(pathname, document.referrer || null).catch(() => {});
  }, [pathname]);

  return null;
}
