import { useState } from 'react';
import CollectionCover from '@/components/CollectionCover';
import ProductImagesUploader from '@/components/ProductImagesUploader';
import type { CoverMode } from '@/hooks/useProductTypes';
import {
    COVER_DISPLAY,
    aspectCss,
    pruneImageDisplay,
    type ImageDisplay,
} from '@/utils/productImageDisplay';

/** Matches MAX_COVER_IMAGES in server/controller/productTypes.js. */
const MAX_COVER_IMAGES = 6;

/** The slice of the collection form this field edits. */
export interface CoversValue {
    coverMode: CoverMode;
    coverImages: string[];
    coverDisplay: ImageDisplay[];
    bannerImages: string[];
    bannerDisplay: ImageDisplay[];
}

interface CollectionCoversFieldProps {
    value: CoversValue;
    onChange: (patch: Partial<CoversValue>) => void;
    onUploadingChange: (isUploading: boolean) => void;
    /** Plural name, for the helper copy. */
    plural: string;
    /** Material Symbols icon, drawn in the preview when a set is empty. */
    icon: string;
}

type Shape = 'tall' | 'banner';

const SHAPES: Record<
    Shape,
    { label: string; short: string; aspect: '4:5' | '16:9'; radius: number; where: string }
> = {
    tall: {
        label: 'Tall card',
        short: 'Tall',
        aspect: '4:5',
        radius: 32,
        where: 'The "Find Your Space" card on the dashboard',
    },
    banner: {
        label: 'Shop banner',
        short: 'Banner',
        aspect: '16:9',
        radius: 24,
        where: 'The "Explore Other Collections" banner on every shop page',
    },
};

/**
 * The cover photos of a collection, which the storefront draws in two shapes: a
 * tall card on the dashboard and a wide banner on the shop page.
 *
 * The admin picks how those relate. "Same photos" keeps one set and crops it for
 * both shapes. "Separate photos" gives each shape its own set, for when a photo
 * that works tall would not work wide. Switching either way is non-destructive:
 * going separate starts the banner from a copy of the tall set, and going back
 * keeps the banner's photos stored in case they are wanted again.
 *
 * Underneath, a live preview shows both shapes as shoppers will see them.
 */
export default function CollectionCoversField({
    value,
    onChange,
    onUploadingChange,
    plural,
    icon,
}: CollectionCoversFieldProps) {
    const [shape, setShape] = useState<Shape>('tall');

    const isSeparate = value.coverMode === 'separate';
    // Shared mode has only the one set, whatever tab was last open.
    const activeShape: Shape = isSeparate ? shape : 'tall';

    const chooseMode = (mode: CoverMode) => {
        if (mode === value.coverMode) return;

        if (mode === 'separate') {
            // The first time, the banner starts as a copy of the tall set, so
            // nothing a shopper sees changes until the admin decides it should.
            const seed =
                value.bannerImages.length === 0
                    ? {
                          bannerImages: [...value.coverImages],
                          bannerDisplay: value.coverDisplay.map((entry) => ({ ...entry })),
                      }
                    : {};

            onChange({ coverMode: 'separate', ...seed });
            setShape('banner');
            return;
        }

        onChange({ coverMode: 'shared' });
        setShape('tall');
    };

    const images = activeShape === 'tall' ? value.coverImages : value.bannerImages;
    const display = activeShape === 'tall' ? value.coverDisplay : value.bannerDisplay;

    const setImages = (next: string[]) => {
        // Framing follows the photos: a removed one takes its crop with it.
        if (activeShape === 'tall') {
            onChange({
                coverImages: next,
                coverDisplay: pruneImageDisplay(value.coverDisplay, next),
            });
        } else {
            onChange({
                bannerImages: next,
                bannerDisplay: pruneImageDisplay(value.bannerDisplay, next),
            });
        }
    };

    const setDisplay = (next: ImageDisplay[]) =>
        onChange(activeShape === 'tall' ? { coverDisplay: next } : { bannerDisplay: next });

    const copyFromTall = () =>
        onChange({
            bannerImages: [...value.coverImages],
            bannerDisplay: value.coverDisplay.map((entry) => ({ ...entry })),
        });

    // What the preview draws: the banner falls back to the tall set until it has
    // photos of its own, exactly as the shop page does.
    const bannerFallsBack = !isSeparate || value.bannerImages.length === 0;
    const previewBanner = bannerFallsBack
        ? { images: value.coverImages, display: value.coverDisplay }
        : { images: value.bannerImages, display: value.bannerDisplay };

    const meta = SHAPES[activeShape];
    const showCopyOffer =
        isSeparate &&
        activeShape === 'banner' &&
        value.bannerImages.length === 0 &&
        value.coverImages.length > 0;

    return (
        <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">
                Collection Covers
            </label>

            {/* Mode */}
            <div role="radiogroup" aria-label="Cover photos" className="grid grid-cols-2 gap-3">
                <ModeOption
                    selected={!isSeparate}
                    onSelect={() => chooseMode('shared')}
                    title="Same photos"
                    hint="One set, cropped for both shapes"
                    tallClass="bg-sage-leaf/70"
                    wideClass="bg-sage-leaf/70"
                />
                <ModeOption
                    selected={isSeparate}
                    onSelect={() => chooseMode('separate')}
                    title="Separate photos"
                    hint="A different set for each shape"
                    tallClass="bg-sage-leaf/70"
                    wideClass="bg-clay/60"
                />
            </div>

            {/* Which set is being edited */}
            {isSeparate ? (
                <div
                    role="tablist"
                    aria-label="Cover set"
                    className="flex gap-1 p-1 rounded-full bg-white/70 border border-forest-moss/10"
                >
                    {(Object.keys(SHAPES) as Shape[]).map((key) => {
                        const count = key === 'tall' ? value.coverImages.length : value.bannerImages.length;
                        const isActive = activeShape === key;

                        return (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setShape(key)}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                    isActive
                                        ? 'bg-forest-moss text-white shadow-soft'
                                        : 'text-forest-moss/50 hover:text-forest-moss'
                                }`}
                            >
                                <span
                                    aria-hidden
                                    style={{ aspectRatio: aspectCss(SHAPES[key].aspect) }}
                                    className={`h-3.5 rounded-[3px] border ${
                                        isActive ? 'border-white/70' : 'border-forest-moss/40'
                                    }`}
                                />
                                {SHAPES[key].label}
                                <span
                                    className={`min-w-5 px-1.5 py-0.5 rounded-full text-[9px] leading-none ${
                                        isActive ? 'bg-white/20' : 'bg-forest-moss/10'
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <p className="text-[10px] font-medium text-forest-moss/40 ml-4">
                    These photos appear on both the tall dashboard card and the wide shop banner.
                </p>
            )}

            {isSeparate && (
                <p className="text-[10px] font-bold text-forest-moss/50 ml-4">
                    {meta.where} ({meta.aspect}).
                </p>
            )}

            {showCopyOffer && (
                <button
                    type="button"
                    onClick={copyFromTall}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-dashed border-forest-moss/30 text-[10px] font-black uppercase tracking-widest text-forest-moss/60 hover:bg-white hover:text-forest-moss transition-all"
                >
                    <span className="material-symbols-outlined !text-base">content_copy</span>
                    Start from the tall card photos ({value.coverImages.length})
                </button>
            )}

            <ProductImagesUploader
                key={activeShape}
                label={isSeparate ? `${meta.label} Photos` : 'Cover Photos'}
                required={false}
                maxImages={MAX_COVER_IMAGES}
                images={images}
                onChange={setImages}
                onUploadingChange={onUploadingChange}
                card={{
                    aspect: meta.aspect,
                    target: isSeparate ? meta.label.toLowerCase() : 'collection card',
                    radius: meta.radius,
                    defaults: COVER_DISPLAY,
                    display,
                    onDisplayChange: setDisplay,
                    // In shared mode one crop serves both shapes, so the editor shows both.
                    alsoShownAs: isSeparate
                        ? []
                        : [{ label: 'the shop banner', aspect: '16:9', radius: 24 }],
                }}
            />

            <p className="text-[9px] font-medium text-forest-moss/30 ml-4">
                {images.length > 1
                    ? `These ${images.length} photos take turns${isSeparate ? ` on the ${meta.label.toLowerCase()}` : ` on the ${plural} card and banner`}.`
                    : `Add more than one and they take turns${isSeparate ? ` on the ${meta.label.toLowerCase()}` : ` on the ${plural} card and banner`}.`}
            </p>

            {!isSeparate && value.bannerImages.length > 0 && (
                <p className="text-[9px] font-bold text-clay ml-4">
                    Your {value.bannerImages.length} separate banner photo
                    {value.bannerImages.length === 1 ? ' is' : 's are'} saved — choose "Separate photos" to
                    use {value.bannerImages.length === 1 ? 'it' : 'them'} again.
                </p>
            )}

            {/* The result, live: both shapes as a shopper sees them. */}
            <div className="bg-white rounded-3xl border border-forest-moss/10 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-forest-moss/40 mb-3">
                    How shoppers see it
                </p>
                <div className="flex items-end gap-4">
                    <figure className="shrink-0 w-[88px] space-y-1.5">
                        <div
                            style={{ aspectRatio: aspectCss('4:5') }}
                            className="relative w-full rounded-2xl overflow-hidden bg-[#f4f5f0] border border-forest-moss/10"
                        >
                            <CollectionCover
                                images={value.coverImages}
                                display={value.coverDisplay}
                                icon={icon}
                                alt=""
                                iconClassName="text-[28px]"
                            />
                        </div>
                        <figcaption className="text-[9px] font-bold text-forest-moss/50 leading-tight">
                            Dashboard card
                        </figcaption>
                    </figure>

                    <figure className="flex-1 min-w-0 max-w-[180px] space-y-1.5">
                        <div
                            style={{ aspectRatio: aspectCss('16:9') }}
                            className="relative w-full rounded-xl overflow-hidden bg-[#f4f5f0] border border-forest-moss/10"
                        >
                            <CollectionCover
                                images={previewBanner.images}
                                display={previewBanner.display}
                                icon={icon}
                                alt=""
                                iconClassName="text-[28px]"
                            />
                        </div>
                        <figcaption className="text-[9px] font-bold text-forest-moss/50 leading-tight">
                            Shop banner
                            {isSeparate && value.bannerImages.length === 0 && value.coverImages.length > 0
                                ? ' — uses the tall photos until you add some'
                                : ''}
                        </figcaption>
                    </figure>
                </div>
            </div>
        </div>
    );
}

interface ModeOptionProps {
    selected: boolean;
    onSelect: () => void;
    title: string;
    hint: string;
    tallClass: string;
    wideClass: string;
}

/** One of the two choices, with a miniature of the two shapes it produces. */
function ModeOption({ selected, onSelect, title, hint, tallClass, wideClass }: ModeOptionProps) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={onSelect}
            className={`px-3 py-3 rounded-3xl border-2 flex flex-col items-center gap-2 text-center transition-all ${
                selected
                    ? 'bg-white border-clay shadow-soft'
                    : 'bg-white/50 border-forest-moss/10 hover:border-forest-moss/30'
            }`}
        >
            <span aria-hidden className="flex items-end gap-1.5 h-9">
                <span className={`h-9 w-7 rounded-md border border-forest-moss/20 ${tallClass}`} />
                <span className={`h-5 w-9 rounded-md border border-forest-moss/20 ${wideClass}`} />
            </span>
            <span>
                <span className="block text-xs font-black text-forest-moss uppercase tracking-widest">
                    {title}
                </span>
                <span className="block text-[9px] font-medium text-forest-moss/40 mt-0.5">{hint}</span>
            </span>
        </button>
    );
}
