import React, { useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import ModalPortal from '@/components/ModalPortal';
import api from '@/utils/Axios';
import type { Swatch } from '@/utils/productFinish';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// The box the photo is fitted into while choosing the circle.
const VIEW_MAX_WIDTH = 460;
const VIEW_MAX_HEIGHT = 340;

// Bounds the work when averaging: the circle is sampled at this resolution
// rather than the photo's, so a huge image costs the same as a small one.
const SAMPLE_SIZE = 192;

// The cropped circle is uploaded at up to this size — plenty for a swatch, small
// enough to stay well inside the 5MB upload limit.
const CROP_MAX_SIZE = 512;

interface Circle {
    /** Centre and radius, in the coordinates of the displayed photo. */
    x: number;
    y: number;
    r: number;
}

interface ImageSwatchCropperProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (swatch: Swatch) => void;
}

/**
 * Turns a photo of a real material into a colour swatch.
 *
 * The admin uploads a picture — a plank of oak, a bolt of linen — and drags a
 * circle over the part they want. That circle is cropped and uploaded, so the
 * swatch keeps the grain or weave instead of flattening to one tone, and its
 * average colour goes along with it for anywhere an image will not do.
 */
export default function ImageSwatchCropper(props: ImageSwatchCropperProps) {
    if (!props.isOpen) return null;

    // Keyed remount means every open starts from the file picker, with no photo
    // or circle left over from last time.
    return <Cropper {...props} />;
}

function Cropper({ onClose, onSelect }: ImageSwatchCropperProps) {
    const [objectUrl, setObjectUrl] = useState('');
    const [view, setView] = useState<{ width: number; height: number } | null>(null);
    const [circle, setCircle] = useState<Circle | null>(null);
    const [averageHex, setAverageHex] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const objectUrlRef = useRef('');
    const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);

    // Only a cleanup — the URL is created in the file handler, not here.
    useEffect(
        () => () => {
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        },
        [],
    );

    /** Natural pixels per displayed pixel. */
    const scale = () => {
        const image = imageRef.current;
        if (!image || !view || view.width === 0) return 1;
        return image.naturalWidth / view.width;
    };

    const measureAverage = (next: Circle) => {
        const image = imageRef.current;
        if (!image) return '';

        const factor = scale();
        const radius = Math.max(1, next.r * factor);
        const centreX = next.x * factor;
        const centreY = next.y * factor;

        const canvas = document.createElement('canvas');
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;

        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return '';

        context.drawImage(
            image,
            centreX - radius,
            centreY - radius,
            radius * 2,
            radius * 2,
            0,
            0,
            SAMPLE_SIZE,
            SAMPLE_SIZE,
        );

        let red = 0;
        let green = 0;
        let blue = 0;
        let counted = 0;

        const { data } = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        const middle = SAMPLE_SIZE / 2;

        for (let y = 0; y < SAMPLE_SIZE; y += 1) {
            for (let x = 0; x < SAMPLE_SIZE; x += 1) {
                const dx = x - middle;
                const dy = y - middle;
                // Only what falls inside the circle counts towards the average.
                if (dx * dx + dy * dy > middle * middle) continue;

                const index = (y * SAMPLE_SIZE + x) * 4;
                if (data[index + 3] < 128) continue;

                red += data[index];
                green += data[index + 1];
                blue += data[index + 2];
                counted += 1;
            }
        }

        if (counted === 0) return '';

        const channel = (total: number) =>
            Math.round(total / counted)
                .toString(16)
                .padStart(2, '0');

        return `#${channel(red)}${channel(green)}${channel(blue)}`;
    };

    const handleFile = (file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            setError('That picture is over 5MB. Try a smaller one.');
            return;
        }

        setError(null);

        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = url;

            // Fit inside the viewing box without ever scaling a small photo up.
            const fit = Math.min(
                VIEW_MAX_WIDTH / image.naturalWidth,
                VIEW_MAX_HEIGHT / image.naturalHeight,
                1,
            );
            const nextView = {
                width: Math.round(image.naturalWidth * fit),
                height: Math.round(image.naturalHeight * fit),
            };

            const nextCircle: Circle = {
                x: nextView.width / 2,
                y: nextView.height / 2,
                r: Math.max(12, Math.min(nextView.width, nextView.height) * 0.2),
            };

            imageRef.current = image;
            setObjectUrl(url);
            setView(nextView);
            setCircle(nextCircle);
            setAverageHex(measureAverage(nextCircle));
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            setError('That file could not be opened as an image.');
        };

        image.src = url;
    };

    /** Keeps the circle wholly inside the photo, whatever the drag or resize. */
    const clamp = (next: Circle): Circle => {
        if (!view) return next;

        const radius = Math.min(next.r, view.width / 2, view.height / 2);

        return {
            r: radius,
            x: Math.min(Math.max(next.x, radius), view.width - radius),
            y: Math.min(Math.max(next.y, radius), view.height - radius),
        };
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!circle) return;

        const bounds = event.currentTarget.getBoundingClientRect();
        const pointerX = event.clientX - bounds.left;
        const pointerY = event.clientY - bounds.top;

        // Clicking outside the circle jumps it there, which is quicker than
        // dragging across the whole photo.
        const dx = pointerX - circle.x;
        const dy = pointerY - circle.y;
        const isInside = dx * dx + dy * dy <= circle.r * circle.r;

        dragOffsetRef.current = isInside ? { x: dx, y: dy } : { x: 0, y: 0 };
        event.currentTarget.setPointerCapture(event.pointerId);

        const moved = clamp({
            ...circle,
            x: pointerX - dragOffsetRef.current.x,
            y: pointerY - dragOffsetRef.current.y,
        });
        setCircle(moved);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!circle || !dragOffsetRef.current) return;

        const bounds = event.currentTarget.getBoundingClientRect();
        const offset = dragOffsetRef.current;

        setCircle(
            clamp({
                ...circle,
                x: event.clientX - bounds.left - offset.x,
                y: event.clientY - bounds.top - offset.y,
            }),
        );
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!dragOffsetRef.current) return;

        dragOffsetRef.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);

        // Averaged once the circle settles rather than on every pointer move.
        if (circle) setAverageHex(measureAverage(circle));
    };

    const handleRadiusChange = (radius: number) => {
        if (!circle) return;

        const next = clamp({ ...circle, r: radius });
        setCircle(next);
        setAverageHex(measureAverage(next));
    };

    const handleConfirm = async () => {
        const image = imageRef.current;
        if (!image || !circle) return;

        setError(null);

        const factor = scale();
        const radius = circle.r * factor;
        const size = Math.max(16, Math.min(Math.round(radius * 2), CROP_MAX_SIZE));

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext('2d');
        if (!context) {
            setError('Your browser could not crop that image.');
            return;
        }

        // Clip to a circle first, so the corners come out transparent and the
        // swatch is genuinely round rather than a square with rounded CSS.
        context.beginPath();
        context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        context.clip();
        context.drawImage(
            image,
            circle.x * factor - radius,
            circle.y * factor - radius,
            radius * 2,
            radius * 2,
            0,
            0,
            size,
            size,
        );

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/png'),
        );

        if (!blob) {
            setError('Your browser could not crop that image.');
            return;
        }

        try {
            setIsUploading(true);

            const formData = new FormData();
            // Named .png to match the blob's type — the upload checks they agree.
            formData.append('image', new File([blob], 'swatch.png', { type: 'image/png' }));

            const response = await api.post('/upload', formData);
            const url: string = response.data?.url ?? '';

            if (!url) {
                setError('The swatch did not upload. Try again.');
                return;
            }

            onSelect({ hex: averageHex, image: url });
            onClose();
        } catch (uploadError) {
            const detail =
                uploadError instanceof AxiosError
                    ? (uploadError.response?.data as { message?: string } | undefined)?.message
                    : undefined;
            setError(detail || 'The swatch did not upload. Try again.');
        } finally {
            setIsUploading(false);
        }
    };

    // The live preview is pure CSS: the same photo, blown up so the chosen circle
    // fills a round window. No second canvas, and it keeps up with the drag.
    const previewStyle = (() => {
        if (!circle || !view) return undefined;

        const zoom = 96 / (circle.r * 2);
        return {
            backgroundImage: `url(${objectUrl})`,
            backgroundSize: `${view.width * zoom}px ${view.height * zoom}px`,
            backgroundPosition: `-${(circle.x - circle.r) * zoom}px -${(circle.y - circle.r) * zoom}px`,
        };
    })();

    const maxRadius = view ? Math.floor(Math.min(view.width, view.height) / 2) : 100;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-forest-moss/40 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-oatmeal w-full max-w-xl rounded-[2rem] shadow-medium overflow-hidden border border-white/50 animate-in zoom-in-95 duration-300 max-h-[92vh] overflow-y-auto">
                    <div className="p-6 space-y-5">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="text-xl font-black text-forest-moss tracking-tight">
                                    Colour from a photo
                                </h3>
                                <p className="text-[11px] font-bold text-forest-moss/40 mt-1">
                                    Upload a picture of the real material, then circle the part you
                                    want.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="size-9 shrink-0 rounded-full bg-white flex items-center justify-center text-forest-moss hover:bg-red-50 hover:text-red-500 transition-all shadow-soft"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {!objectUrl ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex flex-col items-center justify-center py-14 rounded-3xl border-2 border-dashed border-forest-moss/20 bg-white/50 hover:bg-white transition-all group"
                            >
                                <div className="size-14 rounded-full bg-oatmeal flex items-center justify-center text-forest-moss-light mb-3 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined !text-3xl">
                                        add_a_photo
                                    </span>
                                </div>
                                <p className="text-[11px] font-bold text-forest-moss/50 uppercase tracking-widest">
                                    Choose a photo
                                </p>
                                <p className="text-[9px] font-medium text-forest-moss/30 mt-1">
                                    PNG, JPG or WEBP up to 5MB
                                </p>
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <div
                                        onPointerDown={handlePointerDown}
                                        onPointerMove={handlePointerMove}
                                        onPointerUp={handlePointerUp}
                                        onPointerCancel={handlePointerUp}
                                        style={{ width: view?.width, height: view?.height }}
                                        className="relative rounded-2xl overflow-hidden cursor-crosshair touch-none select-none shadow-soft"
                                    >
                                        <img
                                            src={objectUrl}
                                            alt=""
                                            draggable={false}
                                            className="w-full h-full object-cover pointer-events-none"
                                        />

                                        {/* Everything outside the circle is dimmed, so the
                                            chosen area reads clearly. */}
                                        <div
                                            className="absolute inset-0 bg-black/45 pointer-events-none"
                                            style={
                                                circle
                                                    ? {
                                                          maskImage: `radial-gradient(circle ${circle.r}px at ${circle.x}px ${circle.y}px, transparent 99%, #000 100%)`,
                                                          WebkitMaskImage: `radial-gradient(circle ${circle.r}px at ${circle.x}px ${circle.y}px, transparent 99%, #000 100%)`,
                                                      }
                                                    : undefined
                                            }
                                        />

                                        {circle && (
                                            <div
                                                className="absolute rounded-full border-2 border-white shadow-lg pointer-events-none"
                                                style={{
                                                    left: circle.x - circle.r,
                                                    top: circle.y - circle.r,
                                                    width: circle.r * 2,
                                                    height: circle.r * 2,
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-forest-moss/10">
                                    <div
                                        className="size-24 shrink-0 rounded-full border border-black/10 shadow-soft bg-oatmeal"
                                        style={previewStyle}
                                    />

                                    <div className="min-w-0 flex-1 space-y-3">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-forest-moss/40">
                                                Average colour
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span
                                                    className="size-4 rounded-full border border-black/10 shrink-0"
                                                    style={{ backgroundColor: averageHex || undefined }}
                                                />
                                                <span className="font-mono text-xs font-bold text-forest-moss uppercase">
                                                    {averageHex || '—'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-forest-moss/40">
                                                Size
                                            </label>
                                            <input
                                                type="range"
                                                min={12}
                                                max={maxRadius}
                                                value={circle ? Math.round(circle.r) : 12}
                                                onChange={(e) =>
                                                    handleRadiusChange(Number(e.target.value))
                                                }
                                                className="w-full accent-clay"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-[10px] font-black uppercase tracking-widest text-forest-moss/40 hover:text-forest-moss transition-colors"
                                >
                                    Use a different photo
                                </button>
                            </div>
                        )}

                        {error && (
                            <p className="text-[11px] font-bold text-red-500 bg-red-50 rounded-2xl px-4 py-3">
                                {error}
                            </p>
                        )}

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
                                onClick={handleConfirm}
                                disabled={!objectUrl || isUploading}
                                className="flex-[1.5] py-3.5 rounded-full bg-forest-moss text-white font-black text-[11px] uppercase tracking-widest hover:bg-forest-moss-light transition-all shadow-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <span className="animate-spin rounded-full size-3.5 border-2 border-white/40 border-t-white" />
                                        Saving
                                    </>
                                ) : (
                                    'Use this swatch'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        // Reset first so re-picking the same file still fires.
                        e.target.value = '';
                        if (file) handleFile(file);
                    }}
                />
            </div>
        </ModalPortal>
    );
}
