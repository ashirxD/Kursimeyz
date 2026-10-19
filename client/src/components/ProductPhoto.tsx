import {
    DEFAULT_BACKGROUND,
    DEFAULT_DISPLAY,
    type ImageDisplay,
} from '@/utils/productImageDisplay';

interface ProductPhotoProps {
    src: string;
    alt: string;
    /** How to frame it. Omitted means the shop's original, untouched treatment. */
    display?: Pick<ImageDisplay, 'fit' | 'zoom' | 'x' | 'y' | 'padding' | 'background'> | null;
    /** Extra classes for the layer — a caller's hover transform or transition lives here. */
    className?: string;
    loading?: 'lazy' | 'eager';
    /** Hides the photo from screen readers, for a layer that repeats another one. */
    decorative?: boolean;
    onError?: () => void;
    onLoad?: (natural: { width: number; height: number }) => void;
}

/**
 * One product photo, framed.
 *
 * This is the only place a card photo's crop is turned into pixels. The shop
 * card, the admin card, the uploader thumbnails and the crop editor all render
 * through it, which is what guarantees the admin sees what shoppers see.
 *
 * It fills its parent (which must be `relative` and `overflow-hidden`, and sets
 * the aspect ratio) rather than owning a box, so the percentages below always
 * mean "of the card". The photo is laid over the frame like this:
 *
 *   - The image box is `zoom` times the frame, so zooming never re-fetches or
 *     resamples anything — it is the same file drawn larger.
 *   - It is pinned so the point `x%, y%` of the photo stays where an
 *     `object-position: x% y%` would put it. At zoom 1 that is exactly the
 *     familiar object-position pan; above 1 it slides the zoomed photo around
 *     inside the frame, from one edge (0) to the other (100).
 *   - `contain` keeps the whole photo and insets it by `padding`; `cover` fills
 *     the frame edge to edge and crops what spills over.
 */
export default function ProductPhoto({
    src,
    alt,
    display,
    className = '',
    loading = 'lazy',
    decorative = false,
    onError,
    onLoad,
}: ProductPhotoProps) {
    const framing = { ...DEFAULT_DISPLAY, ...display };
    const { fit, zoom, x, y } = framing;
    // Padding is a margin around a whole photo; a photo that fills the frame has none.
    const inset = fit === 'contain' ? framing.padding : 0;

    return (
        <div
            className={`absolute inset-0 overflow-hidden ${className}`}
            style={{
                backgroundColor: framing.background || DEFAULT_BACKGROUND,
                // Percent padding resolves against the frame's width, so the
                // margin scales with the card instead of being a fixed few pixels.
                padding: `${inset}%`,
            }}
        >
            <div className="relative w-full h-full">
                <img
                    src={src}
                    alt={decorative ? '' : alt}
                    aria-hidden={decorative || undefined}
                    loading={loading}
                    draggable={false}
                    onError={onError}
                    onLoad={
                        onLoad
                            ? (event) =>
                                  onLoad({
                                      width: event.currentTarget.naturalWidth,
                                      height: event.currentTarget.naturalHeight,
                                  })
                            : undefined
                    }
                    // max-w/h-none: the base reset caps images at 100%, which would
                    // stop a zoomed photo from growing past the frame.
                    className="absolute max-w-none max-h-none select-none pointer-events-none"
                    style={{
                        width: `${zoom * 100}%`,
                        height: `${zoom * 100}%`,
                        left: `${-(zoom - 1) * x}%`,
                        top: `${-(zoom - 1) * y}%`,
                        objectFit: fit,
                        objectPosition: `${x}% ${y}%`,
                    }}
                />
            </div>
        </div>
    );
}
