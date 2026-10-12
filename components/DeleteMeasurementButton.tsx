'use client';

import { useTransition } from 'react';
import { deleteMeasurement } from '@/app/actions/measurements';

export default function DeleteMeasurementButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => deleteMeasurement(id))}
      className="text-body-sm text-muted-foreground hover:text-destructive transition-colors duration-base cursor-pointer disabled:cursor-wait"
    >
      {pending ? 'Removing…' : 'Remove'}
    </button>
  );
}
