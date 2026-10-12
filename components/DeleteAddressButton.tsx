'use client';

import { useTransition } from 'react';
import { deleteAddress } from '@/app/actions/addresses';

export default function DeleteAddressButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => deleteAddress(id))}
      className="text-body-sm text-muted-foreground hover:text-destructive transition-colors duration-base cursor-pointer disabled:cursor-wait"
    >
      {pending ? 'Removing…' : 'Remove'}
    </button>
  );
}
