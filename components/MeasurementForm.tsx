'use client';

import { useActionState } from 'react';
import { addMeasurement } from '@/app/actions/measurements';
import { initialAuthState } from '@/lib/auth-types';

export default function MeasurementForm() {
  const [state, formAction, pending] = useActionState(addMeasurement, initialAuthState);

  return (
    <form action={formAction} className="space-y-4 rounded-md border border-border bg-card p-6">
      <div>
        <label htmlFor="label" className="block text-body-sm mb-1">Label</label>
        <input id="label" name="label" type="text" defaultValue="My measurements" className="w-full rounded-sm border border-border bg-background px-3 py-2 text-body-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <NumberField name="bust_cm" label="Bust (cm)" />
        <NumberField name="waist_cm" label="Waist (cm)" />
        <NumberField name="hip_cm" label="Hip (cm)" />
        <NumberField name="height_cm" label="Height (cm)" />
      </div>
      {state.status === 'error' && <p className="text-body-sm text-destructive">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-none bg-primary text-on-primary px-8 py-3 text-body-sm uppercase tracking-[0.14em] transition-colors duration-base hover:bg-secondary active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-wait"
      >
        {pending ? 'Saving…' : 'Save measurements'}
      </button>
    </form>
  );
}

function NumberField({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <label htmlFor={name} className="block text-body-sm mb-1">{label}</label>
      <input
        id={name}
        name={name}
        type="number"
        min="1"
        step="0.1"
        required
        className="w-full rounded-sm border border-border bg-background px-3 py-2 text-body-sm"
      />
    </div>
  );
}
