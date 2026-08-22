import {
    FINISH_PARTS,
    finishPartLabel,
    isFinishEmpty,
    isFinishPartEmpty,
    isSwatchEmpty,
    type ProductFinish,
    type Swatch as SwatchValue,
} from '@/utils/productFinish';

const SWATCH_SIZE = {
    xs: 'size-3',
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-10',
} as const;

export type SwatchSize = keyof typeof SWATCH_SIZE;

interface SwatchProps {
    swatch: SwatchValue;
    size?: SwatchSize;
    /** Tooltip text, usually the material name. */
    title?: string;
    className?: string;
}

/**
 * One colour, drawn as a circle.
 *
 * A cropped photo of the real material is shown when there is one, so grain and
 * weave read as themselves; otherwise the flat colour. The ring is drawn with a
 * translucent border so a white or very pale swatch is still visible.
 */
export function Swatch({ swatch, size = 'sm', title, className = '' }: SwatchProps) {
    if (isSwatchEmpty(swatch)) return null;

    const shared = `${SWATCH_SIZE[size]} rounded-full border border-black/10 shrink-0 ${className}`;

    if (swatch.image) {
        return (
            <img
                src={swatch.image}
                alt=""
                title={title}
                // Cropped square-on-a-circle, so cover keeps it centred at any size.
                className={`${shared} object-cover`}
            />
        );
    }

    return (
        <span
            title={title}
            className={shared}
            style={{ backgroundColor: swatch.hex }}
        />
    );
}

interface ProductFinishSummaryProps {
    finish: ProductFinish;
    size?: SwatchSize;
    /**
     * 'inline' puts both parts on one wrapping row — for cards and table rows.
     * 'stacked' gives each its own line — for detail and order pages.
     */
    layout?: 'inline' | 'stacked';
    /** Hidden on tight rows where the swatch alone is enough. */
    showLabels?: boolean;
    className?: string;
}

/**
 * The body/fabric line: a swatch and the material name for each part that has
 * anything to show. Renders nothing at all for a product with no finish, so
 * legacy rows simply look the way they always did.
 */
export default function ProductFinishSummary({
    finish,
    size = 'sm',
    layout = 'inline',
    showLabels = true,
    className = '',
}: ProductFinishSummaryProps) {
    if (isFinishEmpty(finish)) return null;

    const parts = FINISH_PARTS.filter(({ key }) => !isFinishPartEmpty(finish[key]));

    return (
        <div
            className={`flex ${
                layout === 'stacked' ? 'flex-col gap-1.5' : 'flex-wrap items-center gap-x-3 gap-y-1'
            } ${className}`}
        >
            {parts.map(({ key, label }) => {
                const part = finish[key];
                const text = finishPartLabel(part);

                return (
                    <span key={key} className="inline-flex items-center gap-1.5 min-w-0">
                        <Swatch swatch={part.color} size={size} title={text || label} />
                        {showLabels && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/35 shrink-0">
                                {label}
                            </span>
                        )}
                        {text && (
                            <span className="text-[11px] font-bold text-[#1a2f1a]/60 truncate">
                                {text}
                            </span>
                        )}
                    </span>
                );
            })}
        </div>
    );
}
