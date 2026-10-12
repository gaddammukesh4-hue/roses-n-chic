'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthDrawer from '@/components/AuthDrawer';
import { signOut } from '@/app/actions/auth';

export default function AuthControl({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // The real source of truth for "should the drawer be closed" is the
  // signedIn prop, not AuthDrawer's own onSignedIn callback: signIn's
  // server action calls revalidatePath, which can flip this prop to true
  // (unmounting the !signedIn branch, including AuthDrawer/SignInForm)
  // before SignInForm's effect ever runs its onClose() call. Without this,
  // `open` stays stuck true from the original manual open and resurfaces
  // the next time the drawer remounts after a later sign-out.
  useEffect(() => {
    if (signedIn) setOpen(false);
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
            signOut().then(() => router.refresh());
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
