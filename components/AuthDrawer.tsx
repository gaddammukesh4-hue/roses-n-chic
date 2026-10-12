'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp, requestPasswordReset } from '@/app/actions/auth';
import { initialAuthState } from '@/lib/auth-types';
import ClientPortal from '@/components/ClientPortal';
import { createClient } from '@/lib/supabase/client';

type View = 'sign-in' | 'create-account' | 'forgot-password';

export default function AuthDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [view, setView] = useState<View>('sign-in');
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handleSignedIn() {
    // Cart merge lives in AuthControl's signedIn-prop effect, not here --
    // see the comment there for why (this component can unmount as part of
    // the same update that resolves the sign-in action, before this ever
    // runs). router.refresh()/onClose() are harmless best-effort immediacy;
    // AuthControl's effect is the one actually guaranteed to fire.
    router.refresh();
    onClose();
  }

  return (
    <ClientPortal>
      <div
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-0 z-[60] transition-opacity duration-base ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute inset-0 bg-rose-ink/30 cursor-pointer"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={view === 'sign-in' ? 'Sign in' : view === 'create-account' ? 'Create account' : 'Reset password'}
          className={`absolute right-0 top-0 h-full w-full max-w-md p-8 overflow-y-auto border-l border-border shadow-lg transition-transform duration-base ${open ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ background: 'var(--glass-drawer-bg)', backdropFilter: 'blur(var(--glass-drawer-blur))', WebkitBackdropFilter: 'blur(var(--glass-drawer-blur))' }}
        >
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-6 top-6 text-h3 leading-none cursor-pointer">
            &times;
          </button>

          <div className="pt-12">
            {view === 'sign-in' && <SignInForm onSignedIn={handleSignedIn} onForgot={() => setView('forgot-password')} onCreateAccount={() => setView('create-account')} />}
            {view === 'create-account' && <SignUpForm onSignedIn={handleSignedIn} onSignIn={() => setView('sign-in')} />}
            {view === 'forgot-password' && <ForgotPasswordForm onBack={() => setView('sign-in')} />}
          </div>
        </div>
      </div>
    </ClientPortal>
  );
}

function SignInForm({ onSignedIn, onForgot, onCreateAccount }: { onSignedIn: () => void; onForgot: () => void; onCreateAccount: () => void }) {
  const [state, formAction, pending] = useActionState(signIn, initialAuthState);

  useEffect(() => {
    if (state.status === 'success') onSignedIn();
    // onSignedIn is stable (defined inline in the parent per render, but only
    // state.status actually needs to re-trigger this)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="space-y-6">
      <h2 className="text-h2">Sign in</h2>
      <form action={formAction} className="space-y-4">
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Password" name="password" type="password" autoComplete="current-password" />
        {state.status === 'error' && <p className="text-body-sm text-destructive">{state.message}</p>}
        <SubmitButton pending={pending} label="Sign in" pendingLabel="Signing in…" />
      </form>
      <div className="flex justify-between text-body-sm">
        <button type="button" onClick={onForgot} className="text-secondary hover:text-primary transition-colors duration-base cursor-pointer">
          Forgot password?
        </button>
        <button type="button" onClick={onCreateAccount} className="text-secondary hover:text-primary transition-colors duration-base cursor-pointer">
          Create an account
        </button>
      </div>
      <OrDivider />
      <GoogleSignInButton />
    </div>
  );
}

function SignUpForm({ onSignedIn, onSignIn }: { onSignedIn: () => void; onSignIn: () => void }) {
  const [state, formAction, pending] = useActionState(signUp, initialAuthState);

  useEffect(() => {
    // Only treat it as "signed in" if there's no confirmation-email message
    // -- when email confirmation is required, state.status is still
    // 'success' but the user has no session yet.
    if (state.status === 'success' && !state.message) onSignedIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state.status === 'success' && state.message) {
    return (
      <div className="space-y-4">
        <h2 className="text-h2">Almost there</h2>
        <p className="text-body-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-h2">Create account</h2>
      <form action={formAction} className="space-y-4">
        <Field label="Name" name="name" type="text" autoComplete="name" required={false} />
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" required={false} />
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={8} />
        {state.status === 'error' && <p className="text-body-sm text-destructive">{state.message}</p>}
        <SubmitButton pending={pending} label="Create account" pendingLabel="Creating…" />
      </form>
      <button type="button" onClick={onSignIn} className="text-body-sm text-secondary hover:text-primary transition-colors duration-base cursor-pointer">
        Already have an account? Sign in
      </button>
      <OrDivider />
      <GoogleSignInButton />
    </div>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-caption text-muted-foreground" role="separator">
      <span className="h-px flex-1 bg-border" />
      or
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function GoogleSignInButton() {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // On success this navigates away to Google immediately -- only an
    // error leaves us on this page to reset `pending` for.
    if (error) setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="w-full flex items-center justify-center gap-3 rounded-sm border border-border bg-card px-6 py-3 text-body-sm transition-colors duration-base hover:bg-muted cursor-pointer disabled:opacity-50 disabled:cursor-wait"
    >
      <GoogleIcon />
      {pending ? 'Redirecting…' : 'Continue with Google'}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.95 10.7a5.4 5.4 0 0 1 0-3.4V4.97H.95a9 9 0 0 0 0 8.06l3-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
    </svg>
  );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialAuthState);

  return (
    <div className="space-y-6">
      <h2 className="text-h2">Reset password</h2>
      {state.status === 'success' ? (
        <p className="text-body-sm text-primary">{state.message}</p>
      ) : (
        <form action={formAction} className="space-y-4">
          <Field label="Email" name="email" type="email" autoComplete="email" />
          {state.status === 'error' && <p className="text-body-sm text-destructive">{state.message}</p>}
          <SubmitButton pending={pending} label="Send reset link" pendingLabel="Sending…" />
        </form>
      )}
      <button type="button" onClick={onBack} className="text-body-sm text-secondary hover:text-primary transition-colors duration-base cursor-pointer">
        Back to sign in
      </button>
    </div>
  );
}

function Field({ label, name, type, autoComplete, required = true, minLength }: { label: string; name: string; type: string; autoComplete: string; required?: boolean; minLength?: number }) {
  return (
    <div>
      <label htmlFor={name} className="block text-body-sm mb-1">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className="w-full rounded-sm border border-border bg-card px-3 py-2 text-body-sm"
      />
    </div>
  );
}

function SubmitButton({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-none bg-primary text-on-primary px-11 py-[15px] text-body-sm uppercase tracking-[0.14em] transition-colors duration-base hover:bg-secondary active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-wait"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
