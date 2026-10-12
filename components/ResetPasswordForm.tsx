'use client';

import { useActionState } from 'react';
import { updatePassword } from '@/app/actions/auth';
import { initialAuthState } from '@/lib/auth-types';

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialAuthState);

  if (state.status === 'success') {
    return <p className="text-body-sm text-primary">{state.message}</p>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-body-sm mb-1">New password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-sm border border-border bg-card px-3 py-2 text-body-sm"
        />
      </div>
      {state.status === 'error' && <p className="text-body-sm text-destructive">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-none bg-primary text-on-primary px-11 py-[15px] text-body-sm uppercase tracking-[0.14em] transition-colors duration-base hover:bg-secondary active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-wait"
      >
        {pending ? 'Saving…' : 'Save new password'}
      </button>
    </form>
  );
}
