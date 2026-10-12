'use client';

import { useState } from 'react';
import Link from 'next/link';

/** Shown only on mobile (nav.css hides .nav__links there) -- Collections
 * and Atelier had no path to them at all on small screens before this. */
export default function MobileNavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="nav__mobile-menu">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="nav__mobile-toggle"
      >
        {open ? '✕' : '☰'}
      </button>
      {open && (
        <nav aria-label="Main" className="nav__mobile-panel">
          <Link href="/collections" onClick={() => setOpen(false)}>Collections</Link>
          <Link href="/atelier" onClick={() => setOpen(false)}>Atelier</Link>
        </nav>
      )}
    </div>
  );
}
