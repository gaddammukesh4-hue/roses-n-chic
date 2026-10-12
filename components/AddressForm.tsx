'use client';

import { useActionState } from 'react';
import { addAddress } from '@/app/actions/addresses';
import { initialAddressState } from '@/lib/address-types';

export default function AddressForm() {
  const [state, formAction, pending] = useActionState(addAddress, initialAddressState);

  return (
    <form action={formAction} className="space-y-4 rounded-md border border-border bg-card p-6">
      <Field label="Full name" name="full_name" />
      <Field label="Address line 1" name="line1" />
      <Field label="Address line 2 (optional)" name="line2" required={false} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="City" name="city" />
        <Field label="State" name="state" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Postal code" name="postal_code" />
        <Field label="Phone (optional)" name="phone" type="tel" required={false} />
      </div>
      {state.status === 'error' && <p className="text-body-sm text-destructive">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-none bg-primary text-on-primary px-8 py-3 text-body-sm uppercase tracking-[0.14em] transition-colors duration-base hover:bg-secondary active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-wait"
      >
        {pending ? 'Saving…' : 'Save address'}
      </button>
    </form>
  );
}

function Field({ label, name, type = 'text', required = true }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-body-sm mb-1">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-sm border border-border bg-background px-3 py-2 text-body-sm"
      />
    </div>
  );
}
