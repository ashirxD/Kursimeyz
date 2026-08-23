import { useState } from 'react';
import { joinDescriptionBlocks, splitDescriptionBlocks } from '@/utils/productDescription';

interface ProductDescriptionInputProps {
    label: string;
    placeholder: string;
    /** The stored description — one string, blocks separated by a blank line. */
    value: string;
    onChange: (description: string) => void;
}

/**
 * The description field: a stack of resizable textareas the admin grows with a
 * plus button, joined back into the one string the product actually stores.
 *
 * The blocks are held here rather than derived from `value` on every render, so
 * pressing Enter inside a block adds a line to that block instead of splitting
 * it into two boxes under the admin's cursor. `value` seeds them once, which is
 * all the form needs — it is remounted per product.
 */
export default function ProductDescriptionInput({
    label,
    placeholder,
    value,
    onChange,
}: ProductDescriptionInputProps) {
    // Always at least one box to type in, including for a brand-new product.
    const [blocks, setBlocks] = useState<string[]>(() => {
        const existing = splitDescriptionBlocks(value);
        return existing.length > 0 ? existing : [''];
    });

    const commit = (next: string[]) => {
        setBlocks(next);
        onChange(joinDescriptionBlocks(next));
    };

    const editBlock = (index: number, text: string) => {
        commit(blocks.map((block, position) => (position === index ? text : block)));
    };

    const addBlock = () => commit([...blocks, '']);

    const removeBlock = (index: number) => {
        const remaining = blocks.filter((_, position) => position !== index);
        commit(remaining.length > 0 ? remaining : ['']);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light">
                    {label} <span className="text-clay">*</span>
                </label>
                {blocks.length > 1 && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-forest-moss/30">
                        {blocks.length} details
                    </span>
                )}
            </div>

            <div className="space-y-2">
                {blocks.map((block, index) => (
                    <div key={index} className="relative">
                        <textarea
                            rows={3}
                            // resize-y, so a long detail can be opened up as far as
                            // the admin needs while writing it.
                            className="w-full bg-white px-5 py-4 pr-12 rounded-3xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm resize-y min-h-[88px]"
                            placeholder={index === 0 ? placeholder : 'Another detail...'}
                            value={block}
                            onChange={(e) => editBlock(index, e.target.value)}
                        />
                        {blocks.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeBlock(index)}
                                title="Remove this detail"
                                aria-label={`Remove detail ${index + 1}`}
                                className="absolute top-3 right-3 size-8 rounded-full bg-oatmeal text-forest-moss/40 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                                <span className="material-symbols-outlined !text-base">close</span>
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addBlock}
                className="flex items-center gap-1.5 ml-4 text-[10px] font-black uppercase tracking-widest text-forest-moss/50 hover:text-clay transition-colors"
            >
                <span className="material-symbols-outlined !text-base">add_circle</span>
                Add another detail
            </button>

            <p className="text-[9px] font-medium text-forest-moss/30 ml-4">
                Each detail becomes its own paragraph on the product page.
            </p>
        </div>
    );
}
