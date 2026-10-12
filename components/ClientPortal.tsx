'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders children into document.body instead of wherever this is mounted
 * in the tree. Used by AuthDrawer/CartDrawer: both live inside <header
 * class="nav">, which has backdrop-filter -- in WebKit (Safari, including
 * iOS), an ancestor with backdrop-filter becomes the containing block for
 * position:fixed descendants, so the drawers' "fixed inset-0" wrapper was
 * collapsing to the 60px nav bar's own height instead of the full
 * viewport. Chrome doesn't do this, which is why it only broke in Safari.
 * Portaling to body sidesteps the whole containing-block question.
 *
 * Mounts after hydration (not during SSR/first render) so the server and
 * the client's first render match -- avoids a hydration mismatch, since
 * `document` doesn't exist on the server.
 */
export default function ClientPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  // The standard client-only-mount pattern (needed because document.body
  // doesn't exist during SSR) -- the lint rule's cascading-render concern
  // doesn't apply here since this effect has no dependencies and runs
  // exactly once per mount, not in response to a prop/state change.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
