import { useEffect, useRef, useState } from 'react';
import ModalPortal from '@/components/ModalPortal';
import ProductPhoto from '@/components/ProductPhoto';
import { resolveImageUrl } from '@/utils/imageUrl';
import {
    BACKGROUND_SWATCHES,
    DEFAULT_BACKGROUND,
    DEFAULT_DISPLAY,
    MAX_PADDING,
    MAX_ZOOM,
    MIN_ZOOM,
    aspectCss,
    aspectRatio,
    getImageDisplay,
    panRange,
    type CardAspect,
    type ImageDisplay,
    type ImageFit,
    type ImageFraming,
} from '@/utils/productImageDisplay';

/** Tallest the preview frame grows, so a portrait card still fits the modal. */
const FRAME_MAX_HEIGHT = 320;

/** How far an arrow key nudges the photo, in pixels of the preview. */
const KEY_STEP = 8;

/** Another place the same photo is shown, in a different shape. */
export interface SecondaryShape {
    label: string;
    aspect: CardAspect;
    /** Corner radius of that place, in px. */
    radius?: number;
}

interface ProductImageEditorProps {
    /** Every photo of the product, cover first. They are adjusted one by one. */
    images: string[];
    /** Which photo to open on. */
    startIndex?: number;
    /** The shape the photo is shown in — the preview is cut to exactly this. */
    aspect: CardAspect;
    /** Framing saved so far; photos without an entry start from `defaults`. */
    displays: ImageDisplay[];
    /** Where an untouched photo starts, and what Reset returns to. */
    defaults?: ImageFraming;
    /** What the photo is shown as, e.g. "product card" or "home page photo". */
    target?: string;
    /** Corner radius of the main frame, in px, to match the real thing. */
    radius?: number;
    /** Other shapes the same crop also appears in, previewed live underneath. */
    alsoShownAs?: SecondaryShape[];
    title?: string;
    applyLabel?: string;
    isSaving?: boolean;
    /** Receives only the photos whose framing actually changed. */
    onApply: (changed: ImageDisplay[]) => void;
    onClose: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number, places: number) => {
    const factor = 10 ** places;
    return Math.round(value * factor) / factor;
};

const FIT_OPTIONS: Array<{ value: ImageFit; label: string; hint: string; icon: string }> = [
    { value: 'contain', label: 'Fit', hint: 'Show the whole photo', icon: 'fit_screen' },
    { value: 'cover', label: 'Fill', hint: 'Fill the frame, crop the rest', icon: 'crop' },
];

const finalised = (display: ImageDisplay): ImageDisplay => ({
    ...display,
    zoom: round(display.zoom, 2),
    x: round(display.x, 1),
    y: round(display.y, 1),
    padding: round(display.padding, 1),
});

/**
 * Chooses how each photo sits inside its card.
 *
 * The preview is the real thing — the same renderer, the same card shape, the
 * same rounded frame — so there is nothing to translate between "what I set"
 * and "what shoppers see". Drag the photo to choose the visible area, zoom to
 * crop in, and switch between filling the frame and showing the whole piece.
 * The upload itself is never changed; only these numbers are saved.
 *
 * Every photo of the product is here: step through them with the strip or the
 * arrows, adjust each, and save them all in one go. Nothing is saved until Apply.
 *
 * Mount it only while it is open: it seeds from `displays` once.
 */
export default function ProductImageEditor({
    images,
    startIndex = 0,
    aspect,
    displays,
    defaults = DEFAULT_DISPLAY,
    target = 'product card',
    radius = 20,
    alsoShownAs = [],
    title = 'Adjust photos',
    applyLabel = 'Apply',
    isSaving = false,
    onApply,
    onClose,
}: ProductImageEditorProps) {
    // One draft per photo, so moving between them never loses an adjustment.
    const [initial] = useState<Record<string, ImageDisplay>>(() =>
        Object.fromEntries(images.map((url) => [url, getImageDisplay(displays, url, defaults)])),
    );
    const [drafts, setDrafts] = useState(initial);
    const [index, setIndex] = useState(() =>
        Math.min(Math.max(startIndex, 0), Math.max(images.length - 1, 0)),
    );
    const [naturals, setNaturals] = useState<Record<string, { width: number; height: number }>>(
        {},
    );
    const [isDragging, setIsDragging] = useState(false);

    const url = images[index];
    const draft = drafts[url];
    const natural = naturals[url] ?? null;
    const hasMany = images.length > 1;

    const frameRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(
        null,
    );

    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const update = (patch: Partial<ImageDisplay>) => {
        setDrafts((current) => ({ ...current, [url]: { ...current[url], ...patch } }));
    };

    const goTo = (next: number) => {
        dragRef.current = null;
        setIsDragging(false);
        setIndex((next + images.length) % images.length);
    };

    const isEdited = (photo: string) =>
        JSON.stringify(finalised(drafts[photo])) !== JSON.stringify(finalised(initial[photo]));

    /** Moves the photo by a number of preview pixels, from where `from` had it. */
    const nudge = (from: { x: number; y: number }, dx: number, dy: number) => {
        const frame = frameRef.current;
        if (!frame || !natural) return null;

        const range = panRange(
            { width: frame.clientWidth, height: frame.clientHeight },
            natural,
            draft,
        );

        // A photo that exactly fits has no room to move on that axis.
        return {
            x: Math.abs(range.x) > 0.5 ? clamp(from.x + (dx / range.x) * 100, 0, 100) : from.x,
            y: Math.abs(range.y) > 0.5 ? clamp(from.y + (dy / range.y) * 100, 0, 100) : from.y,
        };
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!natural) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = {
            pointerX: event.clientX,
            pointerY: event.clientY,
            x: draft.x,
            y: draft.y,
        };
        setIsDragging(true);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const start = dragRef.current;
        if (!start) return;

        const next = nudge(start, event.clientX - start.pointerX, event.clientY - start.pointerY);
        if (next) update(next);
    };

    const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;

        dragRef.current = null;
        setIsDragging(false);
        event.currentTarget.releasePointerCapture(event.pointerId);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const step = event.shiftKey ? KEY_STEP * 4 : KEY_STEP;
        const moves: Record<string, [number, number]> = {
            ArrowLeft: [-step, 0],
            ArrowRight: [step, 0],
            ArrowUp: [0, -step],
            ArrowDown: [0, step],
        };

        const move = moves[event.key];
        if (!move) return;

        event.preventDefault();
        const next = nudge(draft, move[0], move[1]);
        if (next) update(next);
    };

    const reset = () => update({ ...defaults });

    const copyToAll = () =>
        setDrafts((current) =>
            Object.fromEntries(
                images.map((photo) => [photo, { ...current[url], url: photo }]),
            ),
        );

    const apply = () => onApply(images.filter(isEdited).map((photo) => finalised(drafts[photo])));

    const isContain = draft.fit === 'contain';
    const activeBackground = draft.background || DEFAULT_BACKGROUND;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-forest-moss/40 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-oatmeal w-full max-w-lg rounded-[2rem] shadow-medium overflow-hidden border border-white/50 animate-in zoom-in-95 duration-300 max-h-[94vh] overflow-y-auto">
                    <div className="p-6 space-y-5">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="text-xl font-black text-forest-moss tracking-tight">
                                    {title}
                                </h3>
                                <p className="text-[11px] font-bold text-forest-moss/40 mt-1">
                                    {hasMany
                                        ? `Photo ${index + 1} of ${images.length}${index === 0 ? ' (cover)' : ''} — exactly as it appears in the ${aspect} ${target}.`
                                        : `Exactly how this photo appears in the ${aspect} ${target}.`}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="size-9 shrink-0 rounded-full bg-white flex items-center justify-center text-forest-moss hover:bg-red-50 hover:text-red-500 transition-all shadow-soft"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Every photo, so each can be adjusted in turn. A dot marks the
                            ones changed in this session. */}
                        {hasMany && (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => goTo(index - 1)}
                                    aria-label="Previous photo"
                                    className="size-8 shrink-0 rounded-full bg-white flex items-center justify-center text-forest-moss hover:bg-forest-moss hover:text-white transition-all shadow-soft"
                                >
                                    <span className="material-symbols-outlined !text-lg">chevron_left</span>
                                </button>

                                <div className="flex-1 min-w-0 flex gap-2 overflow-x-auto py-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    {images.map((photo, photoIndex) => (
                                        <button
                                            key={`${photo}-${photoIndex}`}
                                            type="button"
                                            onClick={() => goTo(photoIndex)}
                                            aria-label={`Photo ${photoIndex + 1}${photoIndex === 0 ? ' (cover)' : ''}`}
                                            aria-current={photoIndex === index}
                                            style={{ aspectRatio: aspectCss(aspect) }}
                                            className={`relative h-12 shrink-0 rounded-lg overflow-hidden transition-all ring-2 ring-offset-2 ring-offset-oatmeal ${
                                                photoIndex === index
                                                    ? 'ring-clay'
                                                    : 'ring-transparent opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <ProductPhoto
                                                src={resolveImageUrl(photo)}
                                                alt=""
                                                decorative
                                                display={drafts[photo]}
                                            />
                                            {photoIndex === 0 && (
                                                <span className="absolute bottom-0 inset-x-0 bg-clay text-white text-[7px] font-black uppercase tracking-widest text-center leading-tight py-px">
                                                    Cover
                                                </span>
                                            )}
                                            {isEdited(photo) && (
                                                <span className="absolute top-0.5 right-0.5 size-2 rounded-full bg-clay ring-1 ring-white" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => goTo(index + 1)}
                                    aria-label="Next photo"
                                    className="size-8 shrink-0 rounded-full bg-white flex items-center justify-center text-forest-moss hover:bg-forest-moss hover:text-white transition-all shadow-soft"
                                >
                                    <span className="material-symbols-outlined !text-lg">chevron_right</span>
                                </button>
                            </div>
                        )}

                        {/* The card's own frame: same shape, rounding, border and renderer. */}
                        <div className="space-y-2">
                            <div
                                ref={frameRef}
                                role="slider"
                                tabIndex={0}
                                aria-label="Photo position. Drag, or use the arrow keys."
                                aria-valuetext={`${Math.round(draft.x)}% across, ${Math.round(draft.y)}% down`}
                                aria-valuenow={Math.round(draft.x)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerEnd}
                                onPointerCancel={handlePointerEnd}
                                onKeyDown={handleKeyDown}
                                style={{
                                    aspectRatio: aspectCss(aspect),
                                    maxWidth: Math.round(FRAME_MAX_HEIGHT * aspectRatio(aspect)),
                                    borderRadius: radius,
                                }}
                                className={`relative mx-auto w-full overflow-hidden border border-[#1a2f1a]/[0.06] shadow-soft touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/60 ${
                                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                                }`}
                            >
                                <ProductPhoto
                                    key={url}
                                    src={resolveImageUrl(url)}
                                    alt="Photo being adjusted"
                                    display={draft}
                                    loading="eager"
                                    onLoad={(size) =>
                                        setNaturals((current) => ({ ...current, [url]: size }))
                                    }
                                />

                                {/* Thirds, for lining a piece up — only while moving it. */}
                                <div
                                    aria-hidden
                                    className={`absolute inset-0 pointer-events-none transition-opacity duration-150 ${
                                        isDragging ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    style={{
                                        backgroundImage:
                                            'linear-gradient(to right, transparent calc(33.333% - 0.5px), rgba(255,255,255,0.7) calc(33.333% - 0.5px), rgba(255,255,255,0.7) calc(33.333% + 0.5px), transparent calc(33.333% + 0.5px), transparent calc(66.666% - 0.5px), rgba(255,255,255,0.7) calc(66.666% - 0.5px), rgba(255,255,255,0.7) calc(66.666% + 0.5px), transparent calc(66.666% + 0.5px)), linear-gradient(to bottom, transparent calc(33.333% - 0.5px), rgba(255,255,255,0.7) calc(33.333% - 0.5px), rgba(255,255,255,0.7) calc(33.333% + 0.5px), transparent calc(33.333% + 0.5px), transparent calc(66.666% - 0.5px), rgba(255,255,255,0.7) calc(66.666% - 0.5px), rgba(255,255,255,0.7) calc(66.666% + 0.5px), transparent calc(66.666% + 0.5px))',
                                    }}
                                />
                            </div>

                            <p className="text-center text-[10px] font-bold text-forest-moss/40 uppercase tracking-widest">
                                Drag the photo to reposition it
                            </p>
                        </div>

                        {/* The same crop, as it lands in the other places this photo is used. */}
                        {alsoShownAs.length > 0 && (
                            <div className="space-y-2">
                                {alsoShownAs.map((shape) => (
                                    <div key={shape.label} className="space-y-1">
                                        <p className="text-center text-[9px] font-black uppercase tracking-widest text-forest-moss/40">
                                            Also shown as {shape.label} ({shape.aspect})
                                        </p>
                                        <div
                                            style={{
                                                aspectRatio: aspectCss(shape.aspect),
                                                maxWidth: Math.round(110 * aspectRatio(shape.aspect)),
                                                borderRadius: Math.min(shape.radius ?? 20, 16),
                                            }}
                                            className="relative mx-auto w-full overflow-hidden border border-[#1a2f1a]/[0.06]"
                                        >
                                            <ProductPhoto
                                                src={resolveImageUrl(url)}
                                                alt=""
                                                decorative
                                                display={draft}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="bg-white rounded-2xl p-4 border border-forest-moss/10 space-y-4">
                            <div className="space-y-1.5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-forest-moss/40">
                                    Display
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {FIT_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => update({ fit: option.value })}
                                            aria-pressed={draft.fit === option.value}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 text-left transition-all ${
                                                draft.fit === option.value
                                                    ? 'bg-oatmeal border-clay'
                                                    : 'bg-white border-forest-moss/10 hover:border-forest-moss/30'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined !text-xl text-forest-moss/70">
                                                {option.icon}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block text-xs font-black text-forest-moss uppercase tracking-widest">
                                                    {option.label}
                                                </span>
                                                <span className="block text-[9px] font-medium text-forest-moss/40 leading-tight">
                                                    {option.hint}
                                                </span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <label className="block space-y-1">
                                <span className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-forest-moss/40">
                                    Zoom
                                    <span className="font-mono text-forest-moss">
                                        {draft.zoom.toFixed(2)}×
                                    </span>
                                </span>
                                <input
                                    type="range"
                                    min={MIN_ZOOM}
                                    max={MAX_ZOOM}
                                    step={0.01}
                                    value={draft.zoom}
                                    onChange={(e) => update({ zoom: Number(e.target.value) })}
                                    className="w-full accent-clay"
                                />
                            </label>

                            <label
                                className={`block space-y-1 transition-opacity ${
                                    isContain ? '' : 'opacity-40'
                                }`}
                            >
                                <span className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-forest-moss/40">
                                    Space around photo
                                    <span className="font-mono text-forest-moss">
                                        {isContain ? `${Math.round(draft.padding)}%` : '—'}
                                    </span>
                                </span>
                                <input
                                    type="range"
                                    min={0}
                                    max={MAX_PADDING}
                                    step={0.5}
                                    disabled={!isContain}
                                    value={draft.padding}
                                    onChange={(e) => update({ padding: Number(e.target.value) })}
                                    className="w-full accent-clay disabled:cursor-not-allowed"
                                />
                                {!isContain && (
                                    <span className="block text-[9px] font-medium text-forest-moss/40">
                                        Only applies when the whole photo is shown.
                                    </span>
                                )}
                            </label>

                            <div className="space-y-1.5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-forest-moss/40">
                                    Background
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                    {BACKGROUND_SWATCHES.map((hex) => (
                                        <button
                                            key={hex}
                                            type="button"
                                            onClick={() =>
                                                update({ background: hex === DEFAULT_BACKGROUND ? '' : hex })
                                            }
                                            title={hex}
                                            aria-label={`Background ${hex}`}
                                            aria-pressed={activeBackground.toLowerCase() === hex}
                                            style={{ backgroundColor: hex }}
                                            className={`size-8 rounded-full border border-black/10 transition-all ${
                                                activeBackground.toLowerCase() === hex
                                                    ? 'ring-2 ring-clay ring-offset-2 ring-offset-white'
                                                    : 'hover:scale-110'
                                            }`}
                                        />
                                    ))}
                                    <label
                                        title="Pick any colour"
                                        className="relative size-8 rounded-full border border-dashed border-forest-moss/30 flex items-center justify-center cursor-pointer hover:bg-oatmeal transition-all overflow-hidden"
                                    >
                                        <span className="material-symbols-outlined !text-base text-forest-moss/50">
                                            colorize
                                        </span>
                                        <input
                                            type="color"
                                            aria-label="Custom background colour"
                                            value={/^#[0-9a-f]{6}$/i.test(activeBackground) ? activeBackground : '#ffffff'}
                                            onChange={(e) => update({ background: e.target.value })}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </label>
                                </div>
                                <p className="text-[9px] font-medium text-forest-moss/40">
                                    Shows around a whole photo and behind transparent images.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <button
                                type="button"
                                onClick={reset}
                                className="text-[10px] font-black uppercase tracking-widest text-forest-moss/40 hover:text-forest-moss transition-colors"
                            >
                                Reset
                            </button>
                            {hasMany && (
                                <button
                                    type="button"
                                    onClick={copyToAll}
                                    className="text-[10px] font-black uppercase tracking-widest text-forest-moss/40 hover:text-forest-moss transition-colors"
                                >
                                    Use for all photos
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3.5 rounded-full bg-white border border-forest-moss/10 text-forest-moss font-black text-[11px] uppercase tracking-widest hover:bg-oatmeal transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={apply}
                                disabled={isSaving}
                                className="flex-[1.5] py-3.5 rounded-full bg-forest-moss text-white font-black text-[11px] uppercase tracking-widest hover:bg-forest-moss-light transition-all shadow-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <span className="animate-spin rounded-full size-3.5 border-2 border-white/40 border-t-white" />
                                        Saving
                                    </>
                                ) : (
                                    applyLabel
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
