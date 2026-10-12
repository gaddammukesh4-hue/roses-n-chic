'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { getProductImageUploadUrl, registerProductImage, deleteProductImage } from '@/app/actions/admin-products';

type Media = { id: string; image_url: string | null; sort_order: number };

export default function ImageUploader({ productId, initialMedia }: { productId: string; initialMedia: Media[] }) {
  const [media, setMedia] = useState(initialMedia.filter((m) => m.image_url));
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const signed = await getProductImageUploadUrl(productId, file.name);
      if (signed.error || !signed.path || !signed.token) {
        setError(signed.error ?? 'Could not get an upload URL.');
        return;
      }
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from('product-media').uploadToSignedUrl(signed.path, signed.token, file);
      if (uploadError) {
        setError(uploadError.message);
        return;
      }
      const registered = await registerProductImage(productId, signed.path, media.length);
      if (registered.error) {
        setError(registered.error);
        return;
      }
      window.location.reload();
    } finally {
      setUploading(false);
    }
  }

  function handleDelete(mediaId: string) {
    startTransition(async () => {
      const result = await deleteProductImage(mediaId, productId);
      if (result.error) setError(result.error);
      else setMedia((m) => m.filter((item) => item.id !== mediaId));
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {media.map((m) => (
          <div key={m.id} className="relative w-24 h-28 rounded-sm overflow-hidden border border-border">
            {m.image_url && <Image src={m.image_url} alt="" fill sizes="96px" className="object-cover" />}
            <button
              type="button"
              onClick={() => handleDelete(m.id)}
              disabled={pending}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-ink/70 text-white text-caption leading-none cursor-pointer disabled:opacity-50"
              aria-label="Remove image"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          if (fileRef.current) fileRef.current.value = '';
        }}
        disabled={uploading}
        className="text-body-sm"
      />
      {uploading && <p className="text-body-sm text-muted-foreground">Uploading…</p>}
      {error && <p className="text-body-sm text-destructive">{error}</p>}
    </div>
  );
}
