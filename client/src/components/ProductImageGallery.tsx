import { useState } from 'react';
import { resolveImageUrl } from '@/utils/imageUrl';

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
}

/** Callers should key this on the product id so it resets between products. */
export default function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeIndex = Math.min(activeIndex, Math.max(0, images.length - 1));
  const activeImage = images[safeIndex];
  const hasMultiple = images.length > 1;

  const step = (delta: number) => {
    setActiveIndex((current) => (current + delta + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className="bg-[#f4f5f0] rounded-[3rem] aspect-[4/5] p-12 lg:p-20 overflow-hidden flex items-center justify-center transition-all duration-700 hover:shadow-2xl hover:shadow-black/5">
          <img
            key={activeImage}
            src={resolveImageUrl(activeImage)}
            alt={`${alt} — view ${safeIndex + 1}`}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 size-11 rounded-full bg-white/90 backdrop-blur-md shadow-lg shadow-black/5 flex items-center justify-center text-[#1a2f1a] opacity-0 group-hover:opacity-100 hover:bg-white transition-all"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 size-11 rounded-full bg-white/90 backdrop-blur-md shadow-lg shadow-black/5 flex items-center justify-center text-[#1a2f1a] opacity-0 group-hover:opacity-100 hover:bg-white transition-all"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest text-[#1a2f1a]">
              {safeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === safeIndex}
              className={`shrink-0 size-20 rounded-2xl overflow-hidden bg-[#f4f5f0] p-2 ring-2 transition-all ${
                index === safeIndex
                  ? 'ring-[#ff311b]'
                  : 'ring-transparent hover:ring-[#1a2f1a]/10'
              }`}
            >
              <img
                src={resolveImageUrl(image)}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
