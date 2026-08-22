import { useMemo, useRef, useState } from 'react';
import { MATERIAL_MAX_LENGTH } from '@/utils/productFinish';

interface MaterialInputProps {
    label: string;
    value: string;
    onChange: (material: string) => void;
    /** Materials already used on other products. */
    suggestions: string[];
    isLoading?: boolean;
    placeholder?: string;
    helper?: string;
}

/**
 * Free-text material, backed by everything the admin has typed before: focusing
 * opens the list, typing filters it, and anything new is simply saved with the
 * product and shows up in the list next time.
 *
 * Same interaction as CategoryCombobox, minus the slug matching — a material is
 * just a label, so nothing needs resolving to a row.
 */
export default function MaterialInput({
    label,
    value,
    onChange,
    suggestions,
    isLoading = false,
    placeholder = 'e.g. Solid Oak',
    helper,
}: MaterialInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const typed = value.trim().toLowerCase();

    const matches = useMemo(() => {
        if (!typed) return suggestions;
        return suggestions.filter((material) => material.toLowerCase().includes(typed));
    }, [suggestions, typed]);

    // Only worth offering when it is genuinely a new name.
    const isNew = typed !== '' && !suggestions.some((m) => m.toLowerCase() === typed);

    const select = (material: string) => {
        onChange(material);
        setIsOpen(false);
        inputRef.current?.blur();
    };

    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">
                {label}
            </label>

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    maxLength={MATERIAL_MAX_LENGTH}
                    autoComplete="off"
                    className="w-full bg-white pl-5 pr-11 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setIsOpen(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.stopPropagation();
                            setIsOpen(false);
                        }
                        // The field lives inside the product form; Enter should pick a
                        // material, not submit the whole product.
                        if (e.key === 'Enter' && isOpen) {
                            e.preventDefault();
                            if (matches.length === 1) select(matches[0]);
                            else setIsOpen(false);
                        }
                    }}
                />

                {value ? (
                    <button
                        type="button"
                        title="Clear material"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => select('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full flex items-center justify-center text-forest-moss/40 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                        <span className="material-symbols-outlined !text-lg">close</span>
                    </button>
                ) : (
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 !text-lg text-forest-moss/30 pointer-events-none">
                        expand_more
                    </span>
                )}

                {isOpen && (
                    // preventDefault on mousedown keeps the input from blurring before
                    // the click lands.
                    <div
                        onMouseDown={(e) => e.preventDefault()}
                        className="absolute z-10 mt-2 w-full max-h-52 overflow-y-auto bg-white rounded-3xl border border-forest-moss/10 shadow-medium py-2"
                    >
                        {isLoading && (
                            <p className="px-5 py-2 text-xs font-bold text-forest-moss/30">
                                Loading materials...
                            </p>
                        )}

                        {!isLoading && matches.length === 0 && !isNew && (
                            <p className="px-5 py-2 text-xs font-bold text-forest-moss/30">
                                No materials yet — type one to add it.
                            </p>
                        )}

                        {matches.map((material) => (
                            <button
                                key={material}
                                type="button"
                                onClick={() => select(material)}
                                className={`w-full px-5 py-2.5 text-left text-sm font-bold transition-colors truncate ${
                                    material.toLowerCase() === typed
                                        ? 'text-clay bg-clay/5'
                                        : 'text-forest-moss hover:bg-sage-soft/40'
                                }`}
                            >
                                {material}
                            </button>
                        ))}

                        {isNew && (
                            <button
                                type="button"
                                onClick={() => select(value.trim())}
                                className="w-full flex items-center gap-2 px-5 py-2.5 text-left text-sm font-bold text-clay hover:bg-clay/5 transition-colors border-t border-forest-moss/5 mt-1 pt-3"
                            >
                                <span className="material-symbols-outlined !text-base">add</span>
                                <span className="truncate">Use "{value.trim()}"</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {helper && (
                <p className="text-[9px] font-medium text-forest-moss/30 ml-4">{helper}</p>
            )}
        </div>
    );
}
