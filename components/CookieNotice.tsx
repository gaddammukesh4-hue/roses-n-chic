'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'rnc-cookie-notice-dismissed';

/** Informational notice, not a consent gate -- the only cookies this site
 * sets are functional (auth session, guest cart), never third-party or
 * advertising, so there's nothing to block pending consent. See the
 * Cookies section of /policies/privacy. */
export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Client-only check (localStorage doesn't exist during SSR) -- runs
    // once on mount, not in response to a prop/state change, so the
    // cascading-render concern the lint rule flags doesn't apply here.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable (private browsing, blocked storage) --
      // just skip the notice rather than erroring.
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore -- worst case the notice reappears next visit
    }
  }

  if (!visible) return null;

  return (
    <div role="region" aria-label="Cookie notice" className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-card px-6 py-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <p className="text-body-sm text-muted-foreground max-w-2xl">
          We use cookies to keep you signed in and remember your bag — no advertising or
          third-party tracking cookies. See our{' '}
          <Link href="/policies/privacy" className="text-secondary underline underline-offset-2 hover:text-primary transition-colors duration-base">
            Privacy policy
          </Link>{' '}
          for details.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-none bg-primary text-on-primary px-6 py-2 text-body-sm uppercase tracking-[0.14em] transition-colors duration-base hover:bg-secondary cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
