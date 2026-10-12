'use client';

import { useState } from 'react';
import AddressForm from '@/components/AddressForm';
import type { Address } from '@/lib/address-types';

export default function AddressPicker({ addresses, selectedId, onSelect }: { addresses: Address[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const [showForm, setShowForm] = useState(addresses.length === 0);

  return (
    <div className="space-y-4">
      <h2 className="text-h3">Shipping address</h2>

      {addresses.length > 0 && (
        <div role="radiogroup" aria-label="Shipping address" className="space-y-2">
          {addresses.map((a) => (
            <label
              key={a.id}
              className={`flex items-start gap-3 rounded-md border p-4 text-body-sm cursor-pointer transition-colors duration-base ${selectedId === a.id ? 'border-primary' : 'border-border'}`}
            >
              <input type="radio" name="address" checked={selectedId === a.id} onChange={() => onSelect(a.id)} className="mt-1" />
              <span>
                <span className="block font-medium">{a.full_name}</span>
                <span className="block text-muted-foreground">
                  {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.postal_code}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="text-body-sm text-secondary hover:text-primary transition-colors duration-base cursor-pointer"
        >
          + Add a new address
        </button>
      ) : (
        <AddressForm />
      )}
    </div>
  );
}
