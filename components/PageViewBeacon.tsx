'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/** Logs one page_view per route change, site-wide (mounted once in
 * app/layout.tsx), via POST to a Route Handler rather than a plain Server
 * Action -- see app/api/track-view/route.ts for why. Fire-and-forget:
 * a logging failure must not break navigation. */
export default function PageViewBeacon() {
  const pathname = usePathname();
  const lastLogged = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastLogged.current === pathname) return;
    lastLogged.current = pathname;
    fetch('/api/track-view', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, referrer: document.referrer || null }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
