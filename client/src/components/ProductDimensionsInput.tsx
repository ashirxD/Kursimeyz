import { DIMENSION_LABELS, formatDimensions, type ProductDimensions } from '@/utils/productPricing';

interface ProductDimensionsInputProps {
    value: ProductDimensions;
    onChange: (dimensions: ProductDimensions) => void;
    label?: string;
}

const PLACEHOLDERS: Record<'width' | 'depth' | 'height', string> = {
    width: '180',
    depth: '90',
    height: '75',
};

export default function ProductDimensionsInput({
    value,
    onChange,
    label = 'Dimensions',
}: ProductDimensionsInputProps) {
    const preview = formatDimensions(value);

    const handleMeasurementChange = (key: 'width' | 'depth' | 'height', raw: string) => {
        onChange({
            ...value,
            [key]: raw === '' ? undefined : Number(raw),
        });
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between px-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light">
                    {label}
                </label>
                {preview && (
                    <span className="text-[9px] font-bold text-forest-moss/40 uppercase tracking-widest">
                        {preview}
                    </span>
                )}
            </div>

            <div className="flex items-end gap-2">
                {DIMENSION_LABELS.map(({ key, label: measurementLabel }) => (
                    <div key={key} className="flex-1 space-y-1">
                        <input
                            type="number"
                            min={0}
                            step="any"
                            inputMode="decimal"
                            className="w-full bg-white px-4 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm text-center"
                            placeholder={PLACEHOLDERS[key]}
                            value={value[key] ?? ''}
                            onChange={(e) => handleMeasurementChange(key, e.target.value)}
                            aria-label={measurementLabel}
                        />
                        <p className="text-[9px] font-black uppercase tracking-widest text-forest-moss/30 text-center">
                            {measurementLabel}
                        </p>
                    </div>
                ))}

                <div className="space-y-1">
                    <select
                        value={value.unit ?? 'cm'}
                        onChange={(e) => onChange({ ...value, unit: e.target.value as 'cm' | 'in' })}
                        className="bg-white px-4 py-3 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm cursor-pointer"
                        aria-label="Measurement unit"
                    >
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                    </select>
                    <p className="text-[9px] font-black uppercase tracking-widest text-forest-moss/30 text-center">
                        Unit
                    </p>
                </div>
            </div>
        </div>
    );
}
