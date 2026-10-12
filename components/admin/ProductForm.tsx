'use client';

import { useActionState } from 'react';
import { FABRICS } from '@/lib/catalog-types';
import { initialAdminState, type AdminActionState } from '@/lib/admin-types';

type Initial = {
  name?: string;
  description?: string | null;
  fabric?: string;
  fabric_notes?: string | null;
  care_notes?: string | null;
  price_inr?: number;
  price_usd?: number;
  status?: string;
};

export default function ProductForm({
  action,
  mode,
  initial,
}: {
  action: (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  mode: 'create' | 'edit';
  initial?: Initial;
}) {
  const [state, formAction, pending] = useActionState(action, initialAdminState);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      <Field label="Name" name="name" defaultValue={initial?.name} required />
      <div>
        <label htmlFor="description" className="block text-body-sm mb-1">Description</label>
        <textarea id="description" name="description" defaultValue={initial?.description ?? ''} rows={3} className="w-full rounded-sm border border-border bg-card px-3 py-2 text-body-sm" />
      </div>

      <div>
        <label htmlFor="fabric" className="block text-body-sm mb-1">Fabric</label>
        <select id="fabric" name="fabric" defaultValue={initial?.fabric ?? FABRICS[0]} className="w-full rounded-sm border border-border bg-card px-3 py-2 text-body-sm">
          {FABRICS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <Field label="Fabric notes" name="fabric_notes" defaultValue={initial?.fabric_notes ?? ''} />
      <Field label="Care notes" name="care_notes" defaultValue={initial?.care_notes ?? ''} />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price INR" name="price_inr" type="number" step="0.01" defaultValue={initial?.price_inr !== undefined ? (initial.price_inr / 100).toFixed(2) : ''} required />
        <Field label="Price USD" name="price_usd" type="number" step="0.01" defaultValue={initial?.price_usd !== undefined ? (initial.price_usd / 100).toFixed(2) : ''} required />
      </div>

      {mode === 'edit' && (
        <div>
          <label htmlFor="status" className="block text-body-sm mb-1">Status</label>
          <select id="status" name="status" defaultValue={initial?.status ?? 'draft'} className="w-full rounded-sm border border-border bg-card px-3 py-2 text-body-sm">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      )}

      {state.status === 'error' && <p className="text-body-sm text-destructive">{state.message}</p>}
      {state.status === 'success' && mode === 'edit' && <p className="text-body-sm text-primary">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-none bg-primary text-on-primary px-8 py-3 text-body-sm uppercase tracking-[0.14em] hover:bg-secondary transition-colors duration-base disabled:opacity-50 disabled:cursor-wait"
      >
        {pending ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}
      </button>
    </form>
  );
}

function Field({ label, name, defaultValue, type = 'text', step, required }: { label: string; name: string; defaultValue?: string; type?: string; step?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-body-sm mb-1">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-sm border border-border bg-card px-3 py-2 text-body-sm"
      />
    </div>
  );
}
