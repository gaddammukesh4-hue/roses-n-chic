'use client';

import { useActionState } from 'react';
import { subscribeNewsletter } from '@/app/actions/newsletter';
import { initialAuthState } from '@/lib/auth-types';

export default function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialAuthState);

  if (state.status === 'success') {
    return <p className="text-body-sm text-secondary">You&apos;re on the list.</p>;
  }

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="Your email"
          className="min-w-0 flex-1 rounded-sm border border-border bg-background px-3 py-2 text-body-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-none bg-primary text-on-primary px-5 py-2 text-body-sm uppercase tracking-[0.14em] transition-colors duration-base hover:bg-secondary active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-wait"
        >
          {pending ? 'Joining…' : 'Join'}
        </button>
      </div>
      {state.status === 'error' && <p className="text-caption text-destructive">{state.message}</p>}
    </form>
  );
}
