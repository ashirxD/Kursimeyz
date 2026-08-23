import IconPicker from '@/components/IconPicker';
import ProductColorPicker from '@/components/ProductColorPicker';
import ProductImagesUploader from '@/components/ProductImagesUploader';
import {
    CONTENT_ICON_OPTIONS,
    CTA_ICON_OPTIONS,
} from '@/components/pageEditor/iconOptions';
import {
    AddRowButton,
    ChoiceField,
    EditorCard,
    RepeatableRow,
    Switch,
    TextAreaField,
    TextField,
} from '@/components/pageEditor/fields';
import type { HeroBadgePosition, HomeHeroContent } from '@/hooks/useHomePage';
import { moveItem } from '@/utils/reorder';

/**
 * The dashboard hero's editors, one card per part of it. Each is a controlled
 * component over its own slice, so the page above hands down a value and takes
 * back a whole new slice.
 */

// Mirrors LIMITS in server/utils/homeContent.js. The server clamps regardless;
// matching here means the admin sees the limit instead of losing text on save.
const LIMITS = {
    kicker: 60,
    headline: 40,
    headlineLines: 4,
    subtitle: 400,
    ctaLabel: 40,
    href: 400,
    alt: 120,
    badges: 4,
};

// Presets are shortcuts, not limits — every picker still takes any hex.
const ACCENT_PRESETS = ['#ff311b', '#d27d53', '#8a9a5b', '#54b1a4', '#4b3621'];
const INK_PRESETS = ['#1a2f1a', '#3a4d39', '#4b3621', '#1f2937', '#111827'];
const SURFACE_PRESETS = ['#f8fafc', '#ffffff', '#f2ece0', '#f4f5f0', '#e8ecd7'];
const BADGE_PRESETS = ['#ffffff', '#d27d53', '#ff311b', '#8a9a5b', '#1a2f1a'];

const BADGE_POSITION_OPTIONS: Array<{ value: HeroBadgePosition; label: string }> = [
    { value: 'top-left', label: 'Top L' },
    { value: 'top-right', label: 'Top R' },
    { value: 'bottom-left', label: 'Btm L' },
    { value: 'bottom-right', label: 'Btm R' },
];

interface HeroSectionProps {
    value: HomeHeroContent;
    onChange: (value: HomeHeroContent) => void;
}

export function KickerEditor({ value, onChange }: HeroSectionProps) {
    return (
        <EditorCard
            icon="label"
            title="Kicker"
            hint="The small caps line above the headline"
            defaultOpen
        >
            <TextField
                label="Text"
                value={value.kicker.text}
                maxLength={LIMITS.kicker}
                placeholder="New Collection 2026"
                helper="Leave empty to hide the kicker and its dot."
                onChange={(text) =>
                    onChange({ ...value, kicker: { ...value.kicker, text } })
                }
            />

            <ProductColorPicker
                label="Dot Colour"
                value={value.kicker.dotColor}
                presets={ACCENT_PRESETS}
                onChange={(dotColor) =>
                    onChange({ ...value, kicker: { ...value.kicker, dotColor } })
                }
            />

            <ProductColorPicker
                label="Text Colour"
                value={value.kicker.textColor}
                presets={INK_PRESETS}
                onChange={(textColor) =>
                    onChange({ ...value, kicker: { ...value.kicker, textColor } })
                }
            />
            <p className="text-[10px] font-bold text-forest-moss-light/50 ml-4 -mt-3">
                Drawn at reduced opacity, the way the original design does.
            </p>
        </EditorCard>
    );
}

export function HeadlineEditor({ value, onChange }: HeroSectionProps) {
    const lines = value.headlineLines;
    const atCap = lines.length >= LIMITS.headlineLines;

    const setLines = (next: typeof lines) => onChange({ ...value, headlineLines: next });

    return (
        <EditorCard
            icon="format_size"
            title="Headline"
            hint={`${lines.length} line${lines.length === 1 ? '' : 's'}, each its own colour`}
            defaultOpen
        >
            <div className="space-y-3">
                {lines.map((line, index) => (
                    <RepeatableRow
                        key={index}
                        title={`Line ${index + 1}`}
                        index={index}
                        total={lines.length}
                        onMove={(from, to) => setLines(moveItem(lines, from, to))}
                        onRemove={(at) => setLines(lines.filter((_, i) => i !== at))}
                    >
                        <TextField
                            label="Text"
                            value={line.text}
                            maxLength={LIMITS.headline}
                            placeholder="Sit Back."
                            onChange={(text) =>
                                setLines(
                                    lines.map((row, i) => (i === index ? { ...row, text } : row)),
                                )
                            }
                        />
                        <ProductColorPicker
                            label="Colour"
                            value={line.color}
                            presets={[...INK_PRESETS.slice(0, 2), ...ACCENT_PRESETS.slice(0, 3)]}
                            onChange={(color) =>
                                setLines(
                                    lines.map((row, i) => (i === index ? { ...row, color } : row)),
                                )
                            }
                        />
                    </RepeatableRow>
                ))}

                <AddRowButton
                    label="Add Line"
                    disabled={atCap}
                    disabledLabel={`${LIMITS.headlineLines} lines is the maximum`}
                    onClick={() =>
                        setLines([...lines, { text: '', color: INK_PRESETS[0] }])
                    }
                />
                <p className="text-[10px] font-bold text-forest-moss-light/50">
                    Each line stacks under the last. A line left empty is dropped when you
                    save.
                </p>
            </div>
        </EditorCard>
    );
}

export function BlurbEditor({ value, onChange }: HeroSectionProps) {
    return (
        <EditorCard icon="subject" title="Blurb" hint="The paragraph under the headline">
            <TextAreaField
                label="Text"
                value={value.subtitle}
                maxLength={LIMITS.subtitle}
                rows={4}
                placeholder="What your shop is about, in a sentence or two."
                helper="Leave empty to hide it."
                onChange={(subtitle) => onChange({ ...value, subtitle })}
            />

            <ProductColorPicker
                label="Text Colour"
                value={value.subtitleColor}
                presets={INK_PRESETS}
                onChange={(subtitleColor) => onChange({ ...value, subtitleColor })}
            />
        </EditorCard>
    );
}

export function CtaEditor({ value, onChange }: HeroSectionProps) {
    const { cta } = value;
    const setCta = (patch: Partial<typeof cta>) =>
        onChange({ ...value, cta: { ...cta, ...patch } });

    return (
        <EditorCard
            icon="smart_button"
            title="Button"
            hint={cta.label || 'The main call to action'}
            action={
                <Switch
                    checked={cta.enabled}
                    ariaLabel="Show the hero button"
                    onChange={(enabled) => setCta({ enabled })}
                />
            }
        >
            <TextField
                label="Button Text"
                value={cta.label}
                maxLength={LIMITS.ctaLabel}
                placeholder="Shop Collection"
                onChange={(label) => setCta({ label })}
            />

            <IconPicker
                label="Icon"
                value={cta.icon}
                options={CTA_ICON_OPTIONS}
                onChange={(icon) => setCta({ icon })}
            />

            <ChoiceField
                label="On Click"
                value={cta.action}
                options={[
                    { value: 'scroll', label: 'Scroll', icon: 'keyboard_double_arrow_down' },
                    { value: 'link', label: 'Go to link', icon: 'open_in_new' },
                ]}
                helper={
                    cta.action === 'scroll'
                        ? 'Slides down to the collections grid further down the page.'
                        : 'Sends the visitor to the address below.'
                }
                onChange={(action) => setCta({ action })}
            />

            {cta.action === 'link' && (
                <TextField
                    label="Destination"
                    value={cta.href}
                    maxLength={LIMITS.href}
                    placeholder="/shop/chairs"
                    helper="A path on your site like /shop/chairs, or a full https:// address. Left empty, the button scrolls instead."
                    onChange={(href) => setCta({ href })}
                />
            )}

            <ProductColorPicker
                label="Background"
                value={cta.backgroundColor}
                presets={ACCENT_PRESETS}
                onChange={(backgroundColor) => setCta({ backgroundColor })}
            />

            <ProductColorPicker
                label="Text Colour"
                value={cta.textColor}
                presets={['#ffffff', ...INK_PRESETS.slice(0, 3)]}
                onChange={(textColor) => setCta({ textColor })}
            />
            <p className="text-[10px] font-bold text-forest-moss-light/50 ml-4 -mt-3">
                The glow under the button is drawn from its background colour.
            </p>
        </EditorCard>
    );
}

export function ImageEditor({
    value,
    onChange,
    onUploadingChange,
}: HeroSectionProps & { onUploadingChange: (isUploading: boolean) => void }) {
    const { image } = value;
    const setImage = (patch: Partial<typeof image>) =>
        onChange({ ...value, image: { ...image, ...patch } });

    return (
        <EditorCard
            icon="wallpaper"
            title="Main Image"
            hint="The photo beside the headline"
            defaultOpen
        >
            <ProductImagesUploader
                label="Photo"
                required={false}
                maxImages={1}
                images={image.url ? [image.url] : []}
                onChange={(images) => setImage({ url: images[0] ?? '' })}
                onUploadingChange={onUploadingChange}
            />
            <p className="text-[10px] font-bold text-forest-moss-light/50 ml-4 -mt-4">
                A wide landscape photo works best — it is shown at a 3:2 crop.
            </p>

            <TextField
                label="Photo Description"
                value={image.alt}
                maxLength={LIMITS.alt}
                placeholder="Minimalist Interior Decor"
                helper="Read aloud by screen readers and shown if the photo fails to load."
                onChange={(alt) => setImage({ alt })}
            />

            <ProductColorPicker
                label="Backdrop"
                value={image.backdropColor}
                presets={SURFACE_PRESETS}
                onChange={(backdropColor) => setImage({ backdropColor })}
            />
            <p className="text-[10px] font-bold text-forest-moss-light/50 ml-4 -mt-3">
                The tilted panel peeking out behind the photo, which straightens when a
                visitor hovers it.
            </p>
        </EditorCard>
    );
}

export function BadgesEditor({ value, onChange }: HeroSectionProps) {
    const { badges } = value;
    const items = badges.items;
    const atCap = items.length >= LIMITS.badges;

    const setItems = (next: typeof items) =>
        onChange({ ...value, badges: { ...badges, items: next } });

    return (
        <EditorCard
            icon="blur_circular"
            title="Floating Badges"
            hint={`${items.length} on the photo, shown on hover`}
            action={
                <Switch
                    checked={badges.enabled}
                    ariaLabel="Show the floating badges"
                    onChange={(enabled) =>
                        onChange({ ...value, badges: { ...badges, enabled } })
                    }
                />
            }
        >
            <div className="space-y-3">
                {items.map((badge, index) => (
                    <RepeatableRow
                        key={index}
                        title={`Badge ${index + 1}`}
                        index={index}
                        total={items.length}
                        onMove={(from, to) => setItems(moveItem(items, from, to))}
                        onRemove={(at) => setItems(items.filter((_, i) => i !== at))}
                    >
                        <IconPicker
                            label="Icon"
                            value={badge.icon}
                            options={CONTENT_ICON_OPTIONS}
                            onChange={(icon) =>
                                setItems(
                                    items.map((row, i) => (i === index ? { ...row, icon } : row)),
                                )
                            }
                        />
                        <ProductColorPicker
                            label="Colour"
                            value={badge.color}
                            presets={BADGE_PRESETS}
                            onChange={(color) =>
                                setItems(
                                    items.map((row, i) => (i === index ? { ...row, color } : row)),
                                )
                            }
                        />
                        <ChoiceField
                            label="Corner"
                            value={badge.position}
                            options={BADGE_POSITION_OPTIONS}
                            onChange={(position) =>
                                setItems(
                                    items.map((row, i) =>
                                        i === index ? { ...row, position } : row,
                                    ),
                                )
                            }
                        />
                    </RepeatableRow>
                ))}

                <AddRowButton
                    label="Add Badge"
                    disabled={atCap}
                    disabledLabel={`${LIMITS.badges} badges is the maximum`}
                    onClick={() =>
                        setItems([
                            ...items,
                            { icon: 'eco', color: '#ffffff', position: 'top-right' },
                        ])
                    }
                />
                <p className="text-[10px] font-bold text-forest-moss-light/50">
                    These only appear while a visitor hovers the photo — hover it in the
                    preview to see them. The pill and its edge are tinted from each badge's
                    own colour.
                </p>
            </div>
        </EditorCard>
    );
}
