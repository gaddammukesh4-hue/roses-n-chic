'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductMedia } from '@/lib/catalog-types';

export default function ProductGallery({ media, productName }: { media: ProductMedia[]; productName: string }) {
  const images = media.filter((m) => m.image_url);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] rounded-md overflow-hidden bg-gradient-to-br from-blush to-champagne">
        {active ? (
          <Image
            src={active.image_url!}
            alt={productName}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          // No photo uploaded for this product yet (supabase/README.md has the upload steps).
          <span className="absolute inset-0 flex items-center justify-center text-display font-serif text-white/70" aria-hidden="true">
            {productName.charAt(0)}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === activeIndex}
              className={`relative w-16 h-20 rounded-sm overflow-hidden border cursor-pointer ${i === activeIndex ? 'border-primary' : 'border-border'}`}
            >
              <Image src={m.image_url!} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
