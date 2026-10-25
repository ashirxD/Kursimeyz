import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { resolveImageUrl } from '@/utils/imageUrl';

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
}

// How far a finger must travel sideways before it counts as a swipe rather than
// a tap or a vertical scroll.
const SWIPE_THRESHOLD_PX = 40;

/** Callers should key this on the product id so it resets between products. */
export default function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const safeIndex = Math.min(activeIndex, Math.max(0, images.length - 1));
  const activeImage = images[safeIndex];
  const hasMultiple = images.length > 1;

  const step = useCallback(
    (delta: number) => {
      if (images.length < 2) return;
      setActiveIndex((current) => (current + delta + images.length) % images.length);
    },
    [images.length],
  );

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || !hasMultiple) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    // Mostly-vertical movement is the page scrolling, not a swipe.
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;
    step(dx < 0 ? 1 : -1);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    // The full-screen viewer handles its own keys. React also bubbles events from
    // inside it (a portal) up to this wrapper, which would step a second time.
    if (isViewerOpen) return;
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  };

  // Arrow buttons are hover-only on desktop, but there is no hover on a phone.
  const arrowClass =
    'absolute top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg shadow-black/5 flex items-center justify-center text-[#1a2f1a] hover:bg-white transition-all md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100';

  return (
    <div className="space-y-3" onKeyDown={handleKeyDown}>
      <div className="relative group">
        <button
          type="button"
          onClick={() => setIsViewerOpen(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label={`Enlarge photo ${safeIndex + 1} of ${images.length}`}
          className="block w-full bg-[#f4f5f0] rounded-[2rem] aspect-square p-6 lg:p-10 overflow-hidden transition-all duration-700 hover:shadow-2xl hover:shadow-black/5 cursor-zoom-in"
        >
          <img
            key={activeImage}
            src={resolveImageUrl(activeImage)}
            alt={`${alt} — view ${safeIndex + 1}`}
            decoding="async"
            draggable={false}
            className="w-full h-full object-contain md:group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </button>

        <span className="pointer-events-none absolute top-4 right-4 size-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#1a2f1a]/70">
          <span className="material-symbols-outlined text-[18px]">zoom_in</span>
        </span>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className={`${arrowClass} left-3`}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className={`${arrowClass} right-3`}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            <div
              aria-live="polite"
              className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-[#1a2f1a]"
            >
              {safeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === safeIndex}
              className={`shrink-0 size-16 rounded-xl overflow-hidden bg-[#f4f5f0] p-1.5 ring-2 transition-all ${
                index === safeIndex
                  ? 'ring-[#ff311b]'
                  : 'ring-transparent hover:ring-[#1a2f1a]/10'
              }`}
            >
              <img
                src={resolveImageUrl(image)}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {isViewerOpen && (
        <PhotoViewer
          images={images}
          index={safeIndex}
          alt={alt}
          onStep={step}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </div>
  );
}

interface PhotoViewerProps {
  images: string[];
  index: number;
  alt: string;
  onStep: (delta: number) => void;
  onClose: () => void;
}

/**
 * Full-screen view of one photo. Furniture is bought on grain, weave and finish,
 * which a 460px square can't show. The image is left at its natural size on a
 * dark ground, so a phone's own pinch-to-zoom works on it.
 */
function PhotoViewer({ images, index, alt, onStep, onClose }: PhotoViewerProps) {
  const touchStart = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onStep(-1);
      if (event.key === 'ArrowRight') onStep(1);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose, onStep]);

  const multiple = images.length > 1;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} photos`}
      className="fixed inset-0 z-[130] bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (start === null || !multiple) return;

        const dx = event.changedTouches[0].clientX - start;
        if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) onStep(dx < 0 ? 1 : -1);
      }}
    >
      <img
        src={resolveImageUrl(images[index])}
        alt={`${alt} — photo ${index + 1} of ${images.length}`}
        onClick={(event) => event.stopPropagation()}
        className="max-w-[94vw] max-h-[86vh] object-contain select-none"
        style={{ touchAction: 'pinch-zoom' }}
        draggable={false}
      />

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close photo viewer"
        className="absolute top-4 right-4 size-12 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition-colors"
      >
        <span className="material-symbols-outlined">close</span>
      </button>

      {multiple && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onStep(-1);
            }}
            aria-label="Previous photo"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onStep(1);
            }}
            aria-label="Next photo"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-[12px] font-black tracking-widest">
            {index + 1} / {images.length}
          </p>
        </>
      )}
    </div>,
    document.body,
  );
}
