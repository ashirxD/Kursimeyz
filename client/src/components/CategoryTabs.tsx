import type { Category } from '@/hooks/useCategories';

interface CategoryTabsProps {
    categories: Category[];
    /** Active category slug, or null for "All". */
    value: string | null;
    onChange: (slug: string | null) => void;
    /** Shop pages and the admin panel use different palettes. */
    variant?: 'shop' | 'admin';
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
 * Horizontal pills built from whatever categories the admin has actually used.
 * Empty categories are filtered out, so a name that no longer has products
 * stops showing up without anyone having to delete it.
 */
export default function CategoryTabs({
    categories,
    value,
    onChange,
    variant = 'shop',
    allLabel = 'All',
    totalCount,
}: CategoryTabsProps) {
    const styles = VARIANTS[variant];
    const used = categories.filter((category) => category.productCount > 0);

    // A lone category is the same view as "All" — not worth the row.
    if (used.length === 0) return null;

    const tabClass = (isActive: boolean) =>
        `shrink-0 px-5 py-2 rounded-full border-2 text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer ${
            isActive ? styles.active : styles.inactive
        }`;

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button type="button" onClick={() => onChange(null)} className={tabClass(value === null)}>
                {allLabel}
                {totalCount !== undefined && (
                    <span className={`ml-1.5 ${styles.count}`}>{totalCount}</span>
                )}
            </button>

            {used.map((category) => (
                <button
                    key={category._id}
                    type="button"
                    onClick={() => onChange(category.slug)}
                    className={tabClass(value === category.slug)}
                >
                    {category.name}
                    <span className={`ml-1.5 ${styles.count}`}>{category.productCount}</span>
                </button>
            ))}
        </div>
    );
}
