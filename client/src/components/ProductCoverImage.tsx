import { useState } from 'react';
import { isDisplayableImageUrl } from '@/utils/imageUrl';

interface ProductCoverImageProps {
    /** Gallery images, cover first — straight from getProductImages(). */
    images: string[];
    /** The product name. Also used to label the placeholder. */
    alt: string;
    /** Material Symbols name drawn on the placeholder, usually the collection's. */
    icon?: string;
    /** Inset around the artwork, so furniture never sits flush to the card edge. */
    padClassName?: string;
    /** Extra classes for each layer — the caller's hover transform lives here. */
    layerClassName?: string;
    /**
     * Crossfade to the second gallery image on hover, the way most storefronts
     * preview a product. Off on small cards where hover means nothing.
     */
    showHoverShot?: boolean;
}

/**
 * A product's cover artwork, with a branded placeholder instead of the browser's
 * broken-image icon.
 *
 * Renders bare layers rather than its own box — like CollectionCover — so each
 * card keeps its own aspect ratio, rounding and overlays. The parent must be
 * `relative`.
 *
 * Two things can go wrong with a stored URL, and both land on the placeholder:
 * a path the browser cannot request at all, and a URL that answers with an
 * error. The second is only knowable at runtime, so failures are remembered per
 * URL — which also means a broken cover falls through to the next real photo in
 * the gallery before giving up.
 */
export default function ProductCoverImage({
    images,
    alt,
    icon = 'chair',
    padClassName = 'p-5',
    layerClassName = '',
    showHoverShot = true,
}: ProductCoverImageProps) {
    const [failed, setFailed] = useState<string[]>([]);

    const usable = images.filter(
        (url) => isDisplayableImageUrl(url) && !failed.includes(url),
    );
    const [cover, hoverShot] = usable;

    const markFailed = (url: string) => {
        setFailed((current) => (current.includes(url) ? current : [...current, url]));
    };

    if (!cover) {
        return (
            <div
                role="img"
                aria-label={`${alt} — image unavailable`}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#1a2f1a]/20"
            >
                <span className="material-symbols-outlined text-[38px]">{icon}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.18em]">
                    Image unavailable
                </span>
            </div>
        );
    }

    const layer = `absolute inset-0 w-full h-full object-contain ${padClassName} transition-all duration-500 ease-out`;
    const swaps = showHoverShot && Boolean(hoverShot);

    return (
        <>
            <img
                src={cover}
                alt={alt}
                loading="lazy"
                onError={() => markFailed(cover)}
                className={`${layer} ${swaps ? 'group-hover:opacity-0' : ''} ${layerClassName}`}
            />

            {swaps && (
                <img
                    src={hoverShot}
                    // The stack is one picture to a reader; only the cover is labelled.
                    alt=""
                    aria-hidden
                    loading="lazy"
                    onError={() => markFailed(hoverShot)}
                    className={`${layer} opacity-0 group-hover:opacity-100 ${layerClassName}`}
                />
            )}
        </>
    );
}
