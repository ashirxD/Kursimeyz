import { useMemo, useRef, useState } from 'react';
import type { Category } from '@/hooks/useCategories';
import { slugify } from '@/utils/slug';

interface CategoryComboboxProps {
    label: string;
    /** Category name as typed or picked. The server slugifies it on save. */
    value: string;
    onChange: (name: string) => void;
    categories: Category[];
    isLoading?: boolean;
    placeholder?: string;
}

/**
 * Free-text input backed by the categories already saved for this product type:
 * focusing it opens the saved list, typing filters it, and a name that matches
 * nothing is offered as a new category. Nothing is persisted here — the product
 * save creates the category, so an abandoned form leaves no orphan rows.
 */
export default function CategoryCombobox({
    label,
    value,
    onChange,
    categories,
    isLoading = false,
    placeholder = 'e.g. Slim',
}: CategoryComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const typedSlug = slugify(value);

    const matches = useMemo(() => {
        if (!typedSlug) return categories;
        // Substring match on the slug so "sli" finds "Slim" and "Ultra Slim".
        return categories.filter((category) => category.slug.includes(typedSlug));
    }, [categories, typedSlug]);

    // Only offer to create when the text is a genuinely new name.
    const isNewName = typedSlug !== '' && !categories.some((c) => c.slug === typedSlug);

    const select = (name: string) => {
        onChange(name);
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
                    maxLength={50}
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
                        // The field lives inside the product form; Enter should
                        // pick a category, not submit the whole product.
                        if (e.key === 'Enter' && isOpen) {
                            e.preventDefault();
                            if (matches.length === 1) select(matches[0].name);
                            else setIsOpen(false);
                        }
                    }}
                />

                {value ? (
                    <button
                        type="button"
                        title="Clear category"
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
                    // preventDefault on mousedown keeps the input from blurring
                    // before the click lands.
                    <div
                        onMouseDown={(e) => e.preventDefault()}
                        className="absolute z-10 mt-2 w-full max-h-52 overflow-y-auto bg-white rounded-3xl border border-forest-moss/10 shadow-medium py-2"
                    >
                        {isLoading && (
                            <p className="px-5 py-2 text-xs font-bold text-forest-moss/30">
                                Loading categories...
                            </p>
                        )}

                        {!isLoading && matches.length === 0 && !isNewName && (
                            <p className="px-5 py-2 text-xs font-bold text-forest-moss/30">
                                No categories yet — type one to create it.
                            </p>
                        )}

                        {matches.map((category) => (
                            <button
                                key={category._id}
                                type="button"
                                onClick={() => select(category.name)}
                                className={`w-full flex items-center justify-between gap-3 px-5 py-2.5 text-left text-sm font-bold transition-colors ${
                                    category.slug === typedSlug
                                        ? 'text-clay bg-clay/5'
                                        : 'text-forest-moss hover:bg-sage-soft/40'
                                }`}
                            >
                                <span className="truncate">{category.name}</span>
                                <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-forest-moss/30">
                                    {category.productCount}
                                </span>
                            </button>
                        ))}

                        {isNewName && (
                            <button
                                type="button"
                                onClick={() => select(value)}
                                className="w-full flex items-center gap-2 px-5 py-2.5 text-left text-sm font-bold text-clay hover:bg-clay/5 transition-colors border-t border-forest-moss/5 mt-1 pt-3"
                            >
                                <span className="material-symbols-outlined !text-base">add</span>
                                <span className="truncate">Create "{value.trim()}"</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            <p className="text-[9px] font-medium text-forest-moss/30 ml-4">
                Groups this product on the shop page. Leave empty to skip.
            </p>
        </div>
    );
}
