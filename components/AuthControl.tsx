'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthDrawer from '@/components/AuthDrawer';
import { signOut } from '@/app/actions/auth';
import { useCart } from '@/components/CartProvider';

export default function AuthControl({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { syncAfterSignIn, syncAfterSignOut } = useCart();

  // The real source of truth for "something just signed in" is the signedIn
  // prop, not a child form's resolved-action-state effect: signIn's server
  // action calls revalidatePath, which can flip this prop to true -- and
  // unmount the !signedIn branch (AuthDrawer/SignInForm) as part of that
  // SAME update, before the child's own effect ever gets to run. Both the
  // drawer-closing (`open`) and the cart-merge (`syncAfterSignIn`) depend on
  // this prop instead of that unreliable callback. Confirmed broken by
  // tracing actual execution with Playwright, not by inspection.
  useEffect(() => {
    if (signedIn) {
      setOpen(false);
      syncAfterSignIn();
    }
    // syncAfterSignIn is a fresh closure from useCart() every render; only
    // signedIn flipping should re-trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

  if (signedIn) {
    // No wrapping element -- these two become direct children of
    // .nav__tools (styles/nav.css), which already sets the gap between
    // its items; wrapping them would create one flex item instead of two
    // and break that spacing.
    return (
      <>
        <Link href="/account">Account</Link>
        <button
          type="button"
          onClick={() => {
            signOut().then(() => {
              syncAfterSignOut();
              router.refresh();
            });
          }}
          className="cursor-pointer"
        >
          Sign out
        </button>
      </>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="cursor-pointer">
        Sign in
      </button>
      <AuthDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
