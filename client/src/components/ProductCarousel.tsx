import {
    Children,
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';

interface ProductCarouselProps {
    children: ReactNode;
    /**
     * Width of one slide, as Tailwind `basis-*` classes. Defaults to the five-up
     * shelf the storefront home uses.
     */
    itemClassName?: string;
    /** Names the region for screen readers, e.g. "Top Picks". */
    label?: string;
}

/**
 * A horizontally scrolling shelf.
 *
 * Built on native overflow scrolling with scroll snapping rather than a
 * transform-driven track, so a trackpad, a touch swipe and a keyboard all work
 * without any of it being reimplemented. The arrows are only rendered once the
 * content actually overflows — when every card fits, this reads as a plain row.
 */
export default function ProductCarousel({
    children,
    itemClassName = 'basis-[78%] sm:basis-[calc((100%_-_1.5rem)/2)] md:basis-[calc((100%_-_3rem)/3)] lg:basis-[calc((100%_-_6rem)/5)]',
    label,
}: ProductCarouselProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [scrollable, setScrollable] = useState({ left: false, right: false });
    const slideCount = Children.count(children);

    const measure = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;

        const furthest = track.scrollWidth - track.clientWidth;
        // A pixel of slack: fractional slide widths otherwise leave the right
        // arrow lit at the very end of the track.
        setScrollable({
            left: track.scrollLeft > 1,
            right: track.scrollLeft < furthest - 1,
        });
    }, []);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        measure();
        // Watched rather than measured once: how many slides fit is a breakpoint
        // away from changing, and with it whether the arrows belong at all.
        const observer = new ResizeObserver(measure);
        observer.observe(track);

        return () => observer.disconnect();
    }, [measure, slideCount]);

    const page = (direction: 1 | -1) => {
        const track = trackRef.current;
        if (!track) return;

        // Just under a full viewport, so the page that scrolls in keeps a sliver
        // of the previous card and the shelf never feels like it jumped.
        track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: 'smooth' });
    };

    const overflows = scrollable.left || scrollable.right;

    return (
        <div
            className="relative"
            role={label ? 'region' : undefined}
            aria-label={label}
        >
            <div
                ref={trackRef}
                onScroll={measure}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {Children.map(children, (child, index) => (
                    <div key={index} className={`snap-start shrink-0 ${itemClassName}`}>
                        {child}
                    </div>
                ))}
            </div>

            {overflows && (
                <>
                    <button
                        type="button"
                        onClick={() => page(-1)}
                        disabled={!scrollable.left}
                        aria-label="Previous products"
                        className="hidden sm:flex absolute -left-3 top-[38%] -translate-y-1/2 size-11 rounded-full bg-white shadow-lg shadow-black/10 items-center justify-center text-[#1a2f1a] transition-all hover:bg-[#1a2f1a] hover:text-white disabled:opacity-0 disabled:pointer-events-none"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => page(1)}
                        disabled={!scrollable.right}
                        aria-label="More products"
                        className="hidden sm:flex absolute -right-3 top-[38%] -translate-y-1/2 size-11 rounded-full bg-white shadow-lg shadow-black/10 items-center justify-center text-[#1a2f1a] transition-all hover:bg-[#1a2f1a] hover:text-white disabled:opacity-0 disabled:pointer-events-none"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </>
            )}
        </div>
    );
}
