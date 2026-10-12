'use client';

import { useState, useTransition } from 'react';
import { updateReelUrl } from '@/app/actions/admin-products';

export default function ReelUrlField({ productId, initialUrl }: { productId: string; initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateReelUrl(productId, url.trim());
      if (result.error) setError(result.error);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://…"
        className="flex-1 rounded-sm border border-border bg-card px-3 py-2 text-body-sm"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="text-body-sm text-secondary hover:text-primary transition-colors duration-base cursor-pointer disabled:opacity-50"
      >
        {saved ? 'Saved' : 'Save'}
      </button>
      {error && <p className="text-body-sm text-destructive">{error}</p>}
    </div>
  );
}
