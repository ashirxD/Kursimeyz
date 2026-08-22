import { useState } from 'react';
import ImageSwatchCropper from '@/components/ImageSwatchCropper';
import { Swatch as SwatchDot } from '@/components/ProductFinishSummary';
import { isSwatchEmpty, type Swatch } from '@/utils/productFinish';

interface SwatchPickerProps {
    label: string;
    value: Swatch;
    presets: string[];
    onChange: (swatch: Swatch) => void;
    /** Shown under the row, e.g. what this colour describes. */
    helper?: string;
}

const HEX_PARTIAL = /^#[0-9A-Fa-f]{0,6}$/;
const HEX_FULL = /^#[0-9A-Fa-f]{6}$/;

/**
 * Picks a colour either the usual way — a preset, the OS colour picker, or a typed
 * hex — or by circling a spot on a photo of the real material, which keeps the
 * grain or weave instead of flattening it to one tone.
 *
 * A photo swatch still carries the circle's average colour, so it can be dropped
 * back to a flat colour without re-picking anything.
 */
export default function SwatchPicker({
    label,
    value,
    presets,
    onChange,
    helper,
}: SwatchPickerProps) {
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    const isEmpty = isSwatchEmpty(value);
    const hasPhoto = value.image !== '';
    const hex = value.hex;

    const setHex = (next: string) => onChange({ hex: next, image: '' });

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between px-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light">
                    {label}
                </label>
                {!isEmpty && (
                    <button
                        type="button"
                        onClick={() => onChange({ hex: '', image: '' })}
                        className="text-[9px] font-black uppercase tracking-widest text-forest-moss/30 hover:text-red-500 transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-2xl border border-forest-moss/10">
                {/* What is currently chosen, at a size worth looking at. */}
                {isEmpty ? (
                    <span
                        title="No colour chosen"
                        className="size-9 shrink-0 rounded-full border-2 border-dashed border-forest-moss/20"
                    />
                ) : (
                    <SwatchDot
                        swatch={value}
                        size="lg"
                        title={hasPhoto ? 'Photo swatch' : hex}
                        className="shadow-soft"
                    />
                )}

                <div className="h-6 w-px bg-forest-moss/10 shrink-0" />

                {presets.map((preset) => (
                    <button
                        key={preset}
                        type="button"
                        onClick={() => setHex(preset)}
                        aria-label={`Use ${preset}`}
                        className={`size-7 rounded-full border-2 transition-all shrink-0 ${
                            !hasPhoto && hex.toLowerCase() === preset.toLowerCase()
                                ? 'border-clay scale-110 shadow-soft'
                                : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: preset }}
                    />
                ))}

                <label
                    title="Pick any colour"
                    className="relative size-7 shrink-0 rounded-full border-2 border-dashed border-forest-moss/25 hover:border-clay/50 cursor-pointer overflow-hidden flex items-center justify-center transition-all"
                >
                    <input
                        type="color"
                        value={HEX_FULL.test(hex) ? hex : '#000000'}
                        onChange={(e) => setHex(e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        aria-label="Pick any colour"
                    />
                    <span className="material-symbols-outlined !text-base text-forest-moss/50 pointer-events-none">
                        palette
                    </span>
                </label>

                <button
                    type="button"
                    onClick={() => setIsCropperOpen(true)}
                    title="Take the colour from a photo"
                    className={`size-7 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                        hasPhoto
                            ? 'border-clay bg-clay/10 text-clay'
                            : 'border-dashed border-forest-moss/25 text-forest-moss/50 hover:border-clay/50'
                    }`}
                >
                    <span className="material-symbols-outlined !text-base">add_a_photo</span>
                </button>

                {hasPhoto ? (
                    <span className="ml-auto flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-clay">
                        Photo
                        {hex && (
                            <span className="font-mono text-forest-moss/40 normal-case">{hex}</span>
                        )}
                    </span>
                ) : (
                    <input
                        type="text"
                        value={hex}
                        placeholder="#000000"
                        spellCheck={false}
                        onChange={(e) => {
                            const next = e.target.value;
                            // Accept a half-typed hex so the field is usable while typing.
                            if (next === '' || HEX_PARTIAL.test(next)) setHex(next);
                        }}
                        onBlur={(e) => {
                            // Anything left incomplete on blur is discarded rather than
                            // stored as an unrenderable colour.
                            if (!HEX_FULL.test(e.target.value)) setHex('');
                        }}
                        className="ml-auto w-24 bg-oatmeal/50 px-3 py-1.5 rounded-full border border-forest-moss/10 font-mono text-[11px] font-bold text-forest-moss uppercase focus:outline-none focus:ring-2 focus:ring-clay/50"
                    />
                )}
            </div>

            {helper && (
                <p className="text-[9px] font-medium text-forest-moss/30 ml-4">{helper}</p>
            )}

            <ImageSwatchCropper
                isOpen={isCropperOpen}
                onClose={() => setIsCropperOpen(false)}
                onSelect={onChange}
            />
        </div>
    );
}
