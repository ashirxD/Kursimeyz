import React, { useRef, useState } from 'react';
import ProductImageEditor, { type SecondaryShape } from '@/components/ProductImageEditor';
import ProductPhoto from '@/components/ProductPhoto';
import api from '@/utils/Axios';
import { resolveImageUrl } from '@/utils/imageUrl';
import {
    aspectCss,
    getImageDisplay,
    withImageDisplay,
    type CardAspect,
    type ImageDisplay,
    type ImageFraming,
} from '@/utils/productImageDisplay';
import { getErrorMessage } from '@/utils/apiError';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Turns the uploader into a framed-photo picker: each tile is drawn the way the
 * storefront will draw it, and gets an Adjust button for the crop.
 */
export interface CardPhotoOptions {
    /** The shape the photo is shown in on the storefront. */
    aspect: CardAspect;
    /** Saved framing per photo; photos without an entry use `defaults`. */
    display: ImageDisplay[];
    onDisplayChange: (display: ImageDisplay[]) => void;
    /** Where an untouched photo starts. Defaults to a whole photo with air around it. */
    defaults?: ImageFraming;
    /** What the photo is shown as, e.g. "home page photo". */
    target?: string;
    /** Corner radius of the real frame, in px. */
    radius?: number;
    /** Other shapes the same crop also appears in. */
    alsoShownAs?: SecondaryShape[];
}

interface ProductImagesUploaderProps {
    label: string;
    /** Gallery URLs, cover first. */
    images: string[];
    onChange: (images: string[]) => void;
    onUploadingChange?: (isUploading: boolean) => void;
    /** Cap the gallery — 1 turns this into a single-image picker. */
    maxImages?: number;
    /** Hidden when the field is optional, e.g. a collection cover. */
    required?: boolean;
    /** Opt-in: shows tiles in the card's shape and lets each photo be cropped. */
    card?: CardPhotoOptions;
}

export default function ProductImagesUploader({
    label,
    images,
    onChange,
    onUploadingChange,
    maxImages,
    required = true,
    card,
}: ProductImagesUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [adjustingIndex, setAdjustingIndex] = useState<number | null>(null);

    const setUploading = (uploading: boolean) => {
        setIsUploading(uploading);
        onUploadingChange?.(uploading);
    };

    const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        // Reset immediately so re-picking the same file still fires a change event.
        e.target.value = '';
        if (files.length === 0) return;

        const oversized = files.filter((file) => file.size > MAX_FILE_SIZE);
        if (oversized.length > 0) {
            setError(`Too large (max 5MB): ${oversized.map((file) => file.name).join(', ')}`);
            return;
        }

        setError(null);

        try {
            setUploading(true);
            const formData = new FormData();
            files.forEach((file) => formData.append('images', file));

            const response = await api.post('/upload/multiple', formData);
            const uploadedUrls: string[] = response.data.urls ?? [];

            const merged = [...images, ...uploadedUrls];
            // A capped picker keeps the newest pick rather than silently ignoring it.
            onChange(maxImages ? merged.slice(-maxImages) : merged);
        } catch (uploadError) {
            console.error('Upload failed:', uploadError);
            setError(getErrorMessage(uploadError, 'Failed to upload images.'));
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        onChange(images.filter((_, i) => i !== index));
    };

    const moveImage = (from: number, to: number) => {
        if (to < 0 || to >= images.length || from === to) return;

        const reordered = [...images];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);
        onChange(reordered);
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between px-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light">
                    {label} {required && <span className="text-clay">*</span>}
                </label>
                {images.length > 0 && maxImages !== 1 && (
                    <span className="text-[9px] font-bold text-forest-moss/40 uppercase tracking-widest">
                        {images.length} photo{images.length === 1 ? '' : 's'} · first is the cover
                    </span>
                )}
            </div>

            <div className="relative rounded-3xl border-2 border-dashed border-forest-moss/20 bg-white/50 p-3">
                {images.length > 0 && (
                    <div className={`grid gap-3 mb-3 ${maxImages === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
                        {images.map((url, index) => (
                            <div
                                key={`${url}-${index}`}
                                draggable
                                onDragStart={() => setDraggedIndex(index)}
                                onDragEnd={() => setDraggedIndex(null)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (draggedIndex !== null) moveImage(draggedIndex, index);
                                    setDraggedIndex(null);
                                }}
                                style={card ? { aspectRatio: aspectCss(card.aspect) } : undefined}
                                className={`group relative ${card ? '' : 'aspect-square'} rounded-2xl overflow-hidden bg-oatmeal cursor-grab active:cursor-grabbing ring-2 transition-all ${
                                    index === 0 ? 'ring-clay' : 'ring-transparent'
                                } ${draggedIndex === index ? 'opacity-40' : ''}`}
                            >
                                {card ? (
                                    <ProductPhoto
                                        src={resolveImageUrl(url)}
                                        alt={`Product view ${index + 1}`}
                                        display={getImageDisplay(card.display, url, card.defaults)}
                                    />
                                ) : (
                                    <img
                                        src={resolveImageUrl(url)}
                                        alt={`Product view ${index + 1}`}
                                        className="w-full h-full object-cover pointer-events-none"
                                    />
                                )}

                                {index === 0 && maxImages !== 1 && (
                                    <span className="absolute top-1.5 left-1.5 bg-clay text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                                        Cover
                                    </span>
                                )}

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                    {maxImages !== 1 && (
                                    <button
                                        type="button"
                                        onClick={() => moveImage(index, index - 1)}
                                        disabled={index === 0}
                                        title="Move left"
                                        className="size-7 rounded-full bg-white/90 text-forest-moss flex items-center justify-center hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined !text-sm">chevron_left</span>
                                    </button>
                                    )}
                                    {card && (
                                        <button
                                            type="button"
                                            onClick={() => setAdjustingIndex(index)}
                                            title="Crop and adjust"
                                            className="size-7 rounded-full bg-white/90 text-forest-moss flex items-center justify-center hover:bg-white"
                                        >
                                            <span className="material-symbols-outlined !text-sm">crop</span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        title="Remove image"
                                        className="size-7 rounded-full bg-white/90 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white"
                                    >
                                        <span className="material-symbols-outlined !text-sm">delete</span>
                                    </button>
                                    {maxImages !== 1 && (
                                    <button
                                        type="button"
                                        onClick={() => moveImage(index, index + 1)}
                                        disabled={index === images.length - 1}
                                        title="Move right"
                                        className="size-7 rounded-full bg-white/90 text-forest-moss flex items-center justify-center hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined !text-sm">chevron_right</span>
                                    </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full group flex flex-col items-center justify-center rounded-2xl hover:bg-oatmeal/60 transition-all ${
                        images.length > 0 ? 'py-4' : 'py-10'
                    }`}
                >
                    <div className="size-12 rounded-full bg-oatmeal flex items-center justify-center text-forest-moss-light mb-2 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined !text-3xl">add_photo_alternate</span>
                    </div>
                    <p className="text-[11px] font-bold text-forest-moss/40 uppercase tracking-widest">
                        {maxImages === 1
                            ? images.length > 0
                                ? 'Replace photo'
                                : 'Click to upload a photo'
                            : images.length > 0
                              ? 'Add more photos'
                              : 'Click to upload photos'}
                    </p>
                    <p className="text-[9px] font-medium text-forest-moss/30 mt-1">
                        {maxImages === 1
                            ? 'Any image format, up to 5MB'
                            : 'Any image format, up to 5MB each · select several at once'}
                    </p>
                </button>

                {isUploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center">
                        <div className="size-8 border-4 border-clay border-t-transparent rounded-full animate-spin mb-2" />
                        <span className="text-[10px] font-black text-clay uppercase tracking-widest">Uploading...</span>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-[10px] font-bold text-red-500 ml-4">{error}</p>
            )}

            {card && adjustingIndex !== null && images[adjustingIndex] && (
                <ProductImageEditor
                    images={images}
                    startIndex={adjustingIndex}
                    aspect={card.aspect}
                    displays={card.display}
                    defaults={card.defaults}
                    target={card.target}
                    radius={card.radius}
                    alsoShownAs={card.alsoShownAs}
                    onClose={() => setAdjustingIndex(null)}
                    onApply={(changed) => {
                        card.onDisplayChange(
                            changed.reduce(
                                (list, next) => withImageDisplay(list, next),
                                card.display,
                            ),
                        );
                        setAdjustingIndex(null);
                    }}
                />
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFilesChange}
                className="hidden"
                accept="image/*"
                multiple={maxImages !== 1}
            />
        </div>
    );
}
