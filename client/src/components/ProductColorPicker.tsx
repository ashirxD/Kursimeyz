interface ProductColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    presets: string[];
    label?: string;
}

function normalizeHex(color: string): string {
    const trimmed = color.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
    if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
        const [, r, g, b] = trimmed;
        return `#${r}${r}${g}${g}${b}${b}`;
    }
    return '#4b3621';
}

export default function ProductColorPicker({
    value,
    onChange,
    presets,
    label = 'Color',
}: ProductColorPickerProps) {
    const hexValue = normalizeHex(value);
    const isPreset = presets.some((c) => c.toLowerCase() === hexValue.toLowerCase());

    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">
                {label}
            </label>
            <div className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-2xl border border-forest-moss/10">
                {presets.map((c) => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => onChange(c)}
                        className={`size-8 rounded-full border-2 transition-all shrink-0 ${
                            hexValue.toLowerCase() === c.toLowerCase()
                                ? 'border-clay scale-110 shadow-soft'
                                : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                        aria-label={`Select color ${c}`}
                    />
                ))}

                <label
                    className={`relative size-8 rounded-full border-2 shrink-0 cursor-pointer overflow-hidden flex items-center justify-center transition-all ${
                        !isPreset ? 'border-clay scale-110 shadow-soft' : 'border-dashed border-forest-moss/25 hover:border-clay/50'
                    }`}
                    style={{ backgroundColor: hexValue }}
                    title="Pick a custom color"
                >
                    <input
                        type="color"
                        value={hexValue}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        aria-label="Custom color picker"
                    />
                    <span className="material-symbols-outlined !text-base text-white drop-shadow-sm pointer-events-none">
                        palette
                    </span>
                </label>

                <input
                    type="text"
                    value={hexValue}
                    onChange={(e) => {
                        const next = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(next)) onChange(next);
                    }}
                    onBlur={(e) => onChange(normalizeHex(e.target.value))}
                    className="ml-auto w-24 bg-oatmeal/50 px-3 py-1.5 rounded-full border border-forest-moss/10 font-mono text-[11px] font-bold text-forest-moss uppercase focus:outline-none focus:ring-2 focus:ring-clay/50"
                    placeholder="#000000"
                    spellCheck={false}
                />
            </div>
        </div>
    );
}
