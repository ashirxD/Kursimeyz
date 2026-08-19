import { useEffect, useState } from 'react';
import { resolveImageUrl } from '@/utils/imageUrl';

/** Long enough to read the card, short enough to notice there is more than one. */
const ROTATE_INTERVAL = 4000;

interface CollectionCoverProps {
    /** A product type's covers, first one first. Empty falls back to its icon. */
    images: string[];
    /** Material Symbols name drawn when there are no covers yet. */
    icon: string;
    alt: string;
    /**
     * Classes for the image/fallback layer. Carries the caller's own duration and
     * hover transform, since the layer already owns `transition-all`.
     */
    layerClassName?: string;
    /** Fallback icon size, which differs between the dashboard and shop cards. */
    iconClassName?: string;
}

/**
 * A product type's cover art, rotating when the admin uploaded more than one.
 * Renders bare layers rather than its own box, so each card keeps its own
 * aspect ratio, rounding and overlays — the parent must be `relative`.
 */
export default function CollectionCover({
    images,
    icon,
    alt,
    layerClassName = '',
    iconClassName = 'text-[72px]',
}: CollectionCoverProps) {
    const [index, setIndex] = useState(0);

    // A single cover needs no timer, and anyone who asked the OS for less motion
    // keeps the first image rather than a card that moves on its own.
    useEffect(() => {
        if (images.length < 2) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const timer = window.setInterval(() => {
            setIndex((current) => current + 1);
        }, ROTATE_INTERVAL);

        return () => window.clearInterval(timer);
    }, [images.length]);

    if (images.length === 0) {
        return (
            <div
                className={`w-full h-full flex items-center justify-center bg-[#f4f5f0] transition-all ${layerClassName}`}
            >
                <span className={`material-symbols-outlined text-[#1a2f1a]/15 ${iconClassName}`}>
                    {icon}
                </span>
            </div>
        );
    }

    // Modulo here rather than in the timer, so removing a cover cannot leave the
    // index pointing past the end of the list.
    const active = index % images.length;

    return (
        <>
            {images.map((url, position) => (
                <img
                    key={`${url}-${position}`}
                    src={resolveImageUrl(url)}
                    // The stack is one picture to a reader; only the first is labelled.
                    alt={position === 0 ? alt : ''}
                    // Stacked and crossfaded, so the card never flashes empty mid-swap.
                    className={`absolute inset-0 w-full h-full object-cover transition-all ${
                        position === active ? 'opacity-100' : 'opacity-0'
                    } ${layerClassName}`}
                />
            ))}

            {images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-1.5">
                    {images.map((url, position) => (
                        <span
                            key={`${url}-dot-${position}`}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                position === active ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
