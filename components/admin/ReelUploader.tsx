'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getProductVideoUploadUrl, updateReelUrl } from '@/app/actions/admin-products';

export default function ReelUploader({ productId, initialUrl }: { productId: string; initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [showUrlField, setShowUrlField] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const signed = await getProductVideoUploadUrl(productId, file.name);
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
      const { data: pub } = supabase.storage.from('product-media').getPublicUrl(signed.path);
      const saved = await updateReelUrl(productId, pub.publicUrl);
      if (saved.error) {
        setError(saved.error);
        return;
      }
      setUrl(pub.publicUrl);
    } catch (e) {
      setError((e as Error)?.message ?? 'Unknown upload error.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSavePastedUrl() {
    setError(null);
    const result = await updateReelUrl(productId, pasteUrl.trim());
    if (result.error) setError(result.error);
    else {
      setUrl(pasteUrl.trim());
      setShowUrlField(false);
    }
  }

  async function handleRemove() {
    setError(null);
    const result = await updateReelUrl(productId, '');
    if (result.error) setError(result.error);
    else setUrl('');
  }

  return (
    <div className="space-y-3">
      {url && (
        <div className="relative w-40 rounded-sm overflow-hidden border border-border">
          <video src={url} controls muted className="w-full h-auto block" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-ink/70 text-white text-caption leading-none cursor-pointer"
            aria-label="Remove video"
          >
            &times;
          </button>
        </div>
      )}

      <div className="space-y-2">
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            if (fileRef.current) fileRef.current.value = '';
          }}
          disabled={uploading}
          className="text-body-sm"
        />
        {uploading && <p className="text-body-sm text-muted-foreground">Uploading… this can take a moment for video.</p>}
        <p className="text-caption text-muted-foreground">MP4, WebM, or MOV, up to 50MB.</p>
      </div>

      {!showUrlField ? (
        <button
          type="button"
          onClick={() => setShowUrlField(true)}
          className="text-body-sm text-secondary hover:text-primary transition-colors duration-base cursor-pointer"
        >
          Or paste a video URL instead
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <input
            type="url"
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            placeholder="https://…"
            className="flex-1 rounded-sm border border-border bg-card px-3 py-2 text-body-sm"
          />
          <button type="button" onClick={handleSavePastedUrl} className="text-body-sm text-secondary hover:text-primary transition-colors duration-base cursor-pointer">
            Save
          </button>
        </div>
      )}

      {error && <p className="text-body-sm text-destructive">{error}</p>}
    </div>
  );
}
