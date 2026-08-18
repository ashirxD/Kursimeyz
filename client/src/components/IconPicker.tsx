import { useMemo, useState } from 'react';

/**
 * Material Symbols the shop is likely to want for a furniture category. The
 * font ships thousands of names, but a searchable shortlist beats a free-text
 * field the admin can typo into an invisible icon.
 */
const ICON_OPTIONS: Array<{ name: string; keywords: string }> = [
    { name: 'chair', keywords: 'chair seat' },
    { name: 'chair_alt', keywords: 'chair stool seat' },
    { name: 'weekend', keywords: 'sofa couch lounge' },
    { name: 'table_restaurant', keywords: 'table dining' },
    { name: 'table_bar', keywords: 'table bar side' },
    { name: 'bed', keywords: 'bed bedroom mattress' },
    { name: 'king_bed', keywords: 'bed double king bedroom' },
    { name: 'single_bed', keywords: 'bed single bedroom' },
    { name: 'door_open', keywords: 'wardrobe closet door cupboard' },
    { name: 'shelves', keywords: 'shelf shelving storage rack' },
    { name: 'inventory_2', keywords: 'box storage cabinet drawer' },
    { name: 'countertops', keywords: 'counter kitchen worktop' },
    { name: 'kitchen', keywords: 'kitchen fridge appliance' },
    { name: 'light', keywords: 'lamp light lighting ceiling' },
    { name: 'floor_lamp', keywords: 'lamp light floor standing' },
    { name: 'desk', keywords: 'desk office work study' },
    { name: 'living', keywords: 'living room lounge armchair' },
    { name: 'bathtub', keywords: 'bath bathroom tub' },
    { name: 'checkroom', keywords: 'hanger wardrobe coat closet' },
    { name: 'blinds', keywords: 'blinds curtain window shade' },
    { name: 'carpenter', keywords: 'wood craft tools carpentry' },
    { name: 'yard', keywords: 'garden outdoor patio plant' },
    { name: 'deck', keywords: 'outdoor patio deck garden' },
    { name: 'stroller', keywords: 'kids children nursery baby' },
    { name: 'crib', keywords: 'baby cot nursery children' },
    { name: 'mirror', keywords: 'mirror glass dressing' },
    { name: 'photo_frame', keywords: 'frame art picture decor' },
    { name: 'rug', keywords: 'rug carpet mat floor' },
    { name: 'category', keywords: 'other general misc default' },
];

interface IconPickerProps {
    label: string;
    value: string;
    onChange: (icon: string) => void;
}

export default function IconPicker({ label, value, onChange }: IconPickerProps) {
    const [search, setSearch] = useState('');

    const matches = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return ICON_OPTIONS;
        return ICON_OPTIONS.filter(
            (icon) => icon.name.includes(query) || icon.keywords.includes(query),
        );
    }, [search]);

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between px-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light">
                    {label}
                </label>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-forest-moss/40 uppercase tracking-widest">
                    <span className="material-symbols-outlined !text-base text-clay">{value}</span>
                    {value}
                </span>
            </div>

            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search icons — bed, lamp, storage..."
                className="w-full bg-white px-5 py-2.5 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-xs"
            />

            <div className="grid grid-cols-8 gap-1.5 max-h-36 overflow-y-auto rounded-3xl border border-forest-moss/10 bg-white p-2.5">
                {matches.map((icon) => (
                    <button
                        key={icon.name}
                        type="button"
                        title={icon.name}
                        onClick={() => onChange(icon.name)}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                            value === icon.name
                                ? 'bg-clay text-white shadow-soft'
                                : 'text-forest-moss/50 hover:bg-sage-soft/50 hover:text-forest-moss'
                        }`}
                    >
                        <span className="material-symbols-outlined !text-xl">{icon.name}</span>
                    </button>
                ))}

                {matches.length === 0 && (
                    <p className="col-span-8 py-3 text-center text-[10px] font-bold text-forest-moss/30 uppercase tracking-widest">
                        No icons match "{search}"
                    </p>
                )}
            </div>
        </div>
    );
}
