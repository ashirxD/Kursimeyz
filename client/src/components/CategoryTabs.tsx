import type { Category } from '@/hooks/useCategories';

interface CategoryTabsProps {
    categories: Category[];
    /** Active category slug, or null for "All". */
    value: string | null;
    onChange: (slug: string | null) => void;
    /** Shop pages and the admin panel use different palettes. */
    variant?: 'shop' | 'admin';
    /**
     * 'horizontal' is the scrolling pill row above a grid; 'vertical' stacks
     * full-width rows for a filter sidebar.
     */
    orientation?: 'horizontal' | 'vertical';
    allLabel?: string;
    /** Total shown next to "All"; omit to hide the count. */
    totalCount?: number;
}

const VARIANTS = {
    shop: {
        active: 'bg-[#1a2f1a] text-white border-[#1a2f1a]',
        inactive:
            'bg-white text-[#1a2f1a]/60 border-[#1a2f1a]/10 hover:border-[#1a2f1a] hover:text-[#1a2f1a]',
        count: 'text-current opacity-40',
    },
    admin: {
        active: 'bg-forest-moss text-white border-forest-moss',
        inactive:
            'bg-white text-forest-moss/60 border-forest-moss/10 hover:border-forest-moss hover:text-forest-moss',
        count: 'text-current opacity-40',
    },
} as const;

/**
 * Category pills built from whatever categories the admin has actually used.
 * Empty categories are filtered out, so a name that no longer has products
 * stops showing up without anyone having to delete it.
 *
 * A caller that draws its own chrome around this — a sidebar card, say — should
 * gate it on hasUsableCategories() from useCategories, since this renders
 * nothing when there is nothing to choose between.
 */
export default function CategoryTabs({
    categories,
    value,
    onChange,
    variant = 'shop',
    orientation = 'horizontal',
    allLabel = 'All',
    totalCount,
}: CategoryTabsProps) {
    const styles = VARIANTS[variant];
    const used = categories.filter((category) => category.productCount > 0);

    // A lone category is the same view as "All" — not worth the row.
    if (used.length === 0) return null;

    const isVertical = orientation === 'vertical';

    const listClass = isVertical
        ? 'flex flex-col gap-2'
        : 'flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

    // Stacked rows fill the sidebar and push their count to the far edge; the
    // row is the hit target, so the label is left-aligned rather than centred.
    const tabClass = (isActive: boolean) =>
        `rounded-full border-2 text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer ${
            isVertical
                ? 'w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left'
                : 'shrink-0 px-5 py-2'
        } ${isActive ? styles.active : styles.inactive}`;

    return (
        <div className={listClass}>
            <button type="button" onClick={() => onChange(null)} className={tabClass(value === null)}>
                <span className="truncate min-w-0">{allLabel}</span>
                {totalCount !== undefined && (
                    <span className={`shrink-0 ${isVertical ? '' : 'ml-1.5'} ${styles.count}`}>
                        {totalCount}
                    </span>
                )}
            </button>

            {used.map((category) => (
                <button
                    key={category._id}
                    type="button"
                    onClick={() => onChange(category.slug)}
                    className={tabClass(value === category.slug)}
                >
                    <span className="truncate min-w-0">{category.name}</span>
                    <span className={`shrink-0 ${isVertical ? '' : 'ml-1.5'} ${styles.count}`}>
                        {category.productCount}
                    </span>
                </button>
            ))}
        </div>
    );
}
