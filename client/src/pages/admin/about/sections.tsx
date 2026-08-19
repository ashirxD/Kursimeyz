import IconPicker from '@/components/IconPicker';
import ProductColorPicker from '@/components/ProductColorPicker';
import ProductImagesUploader from '@/components/ProductImagesUploader';
import type { AboutPageContent, AboutSectionKey } from '@/hooks/useAboutPage';
import { moveItem } from '@/utils/reorder';
import { CONTENT_ICON_OPTIONS } from '@/components/pageEditor/iconOptions';
import { SECTION_META } from './meta';
import {
    AddRowButton,
    ChoiceField,
    EditorCard,
    RepeatableRow,
    Switch,
    TextAreaField,
    TextField,
} from '@/components/pageEditor/fields';

/**
 * One editor per About page section. Each is a controlled component over its own
 * slice of the content, so the page above only has to hand down a value and take
 * back a whole new slice — no shared mutation helpers, no casts.
 */

// Mirrors LIMITS in server/utils/aboutContent.js. The server clamps regardless;
// matching here means the admin sees the limit instead of losing text on save.
const LIMITS = {
    eyebrow: 60,
    title: 90,
    heading: 120,
    paragraph: 1200,
    label: 80,
    statValue: 12,
    badgeValue: 12,
    href: 400,
    values: 8,
    stats: 8,
    paragraphs: 8,
    links: 5,
};

// Presets are shortcuts, not limits — every picker still takes any hex.
const ACCENT_PRESETS = ['#ff6b35', '#d27d53', '#8a9a5b', '#54b1a4', '#4b3621'];
const INK_PRESETS = ['#1a2f1a', '#3a4d39', '#4b3621', '#1f2937', '#111827'];
const SURFACE_PRESETS = ['#f4f5f0', '#f2ece0', '#e8ecd7', '#f5e8e1', '#ffffff'];
const PANEL_PRESETS = ['#1a2f1a', '#3a4d39', '#4b3621', '#d27d53', '#111827'];

interface SectionProps<K extends AboutSectionKey> {
    value: AboutPageContent[K];
    onChange: (value: AboutPageContent[K]) => void;
}

/** The on/off switch every section card carries in its header. */
function EnabledSwitch({
    label,
    enabled,
    onChange,
}: {
    label: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}) {
    return (
        <Switch checked={enabled} onChange={onChange} ariaLabel={`Show ${label} section`} />
    );
}

export function ThemeEditor({
    value,
    onChange,
}: {
    value: AboutPageContent['theme'];
    onChange: (value: AboutPageContent['theme']) => void;
}) {
    const hasCustomBackground = value.pageBackground !== '';

    return (
        <EditorCard
            icon="palette"
            title="Colours"
            hint="Applies to every section on the page"
            defaultOpen
        >
            <ProductColorPicker
                label="Accent"
                value={value.accentColor}
                presets={ACCENT_PRESETS}
                onChange={(accentColor) => onChange({ ...value, accentColor })}
            />
            <p className="text-[10px] font-bold text-forest-moss-light/50 ml-4 -mt-3">
                Kicker dots, the second headline line, value icons, the badge and the
                highlighted contact button.
            </p>

            <ProductColorPicker
                label="Headings"
                value={value.headingColor}
                presets={INK_PRESETS}
                onChange={(headingColor) => onChange({ ...value, headingColor })}
            />

            <ProductColorPicker
                label="Body Text"
                value={value.bodyColor}
                presets={INK_PRESETS}
                onChange={(bodyColor) => onChange({ ...value, bodyColor })}
            />
            <p className="text-[10px] font-bold text-forest-moss-light/50 ml-4 -mt-3">
                Paragraphs and small labels are drawn from this at reduced opacity.
            </p>

            <ProductColorPicker
                label="Value Card Background"
                value={value.cardBackground}
                presets={SURFACE_PRESETS}
                onChange={(cardBackground) => onChange({ ...value, cardBackground })}
            />

            <ProductColorPicker
                label="Contact Panel"
                value={value.contactBackground}
                presets={PANEL_PRESETS}
                onChange={(contactBackground) => onChange({ ...value, contactBackground })}
            />
            <p className="text-[10px] font-bold text-forest-moss-light/50 ml-4 -mt-3">
                The panel's text switches between light and dark on its own, whichever
                reads better on the colour you pick.
            </p>

            <div className="border-t border-forest-moss/5 pt-5 space-y-3">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black text-forest-moss uppercase tracking-widest">
                            Custom Page Background
                        </p>
                        <p className="text-[10px] font-bold text-forest-moss-light/50 mt-0.5">
                            Off means the page keeps the site background.
                        </p>
                    </div>
                    <Switch
                        checked={hasCustomBackground}
                        ariaLabel="Use a custom page background"
                        onChange={(checked) =>
                            onChange({ ...value, pageBackground: checked ? '#ffffff' : '' })
                        }
                    />
                </div>

                {hasCustomBackground && (
                    <ProductColorPicker
                        label="Page Background"
                        value={value.pageBackground}
                        presets={SURFACE_PRESETS}
                        onChange={(pageBackground) => onChange({ ...value, pageBackground })}
                    />
                )}
            </div>
        </EditorCard>
    );
}

export function HeroEditor({ value, onChange }: SectionProps<'hero'>) {
    return (
        <EditorCard
            icon={SECTION_META.hero.icon}
            title={SECTION_META.hero.label}
            hint={SECTION_META.hero.hint}
            action={
                <EnabledSwitch
                    label="Hero"
                    enabled={value.enabled}
                    onChange={(enabled) => onChange({ ...value, enabled })}
                />
            }
        >
            <TextField
                label="Kicker"
                value={value.eyebrow}
                maxLength={LIMITS.eyebrow}
                placeholder="Our Story"
                helper="The small caps line above the headline. Leave empty to hide it."
                onChange={(eyebrow) => onChange({ ...value, eyebrow })}
            />
            <TextField
                label="Headline — First Line"
                value={value.titleLine1}
                maxLength={LIMITS.title}
                placeholder="Crafting Comfort"
                onChange={(titleLine1) => onChange({ ...value, titleLine1 })}
            />
            <TextField
                label="Headline — Second Line"
                value={value.titleLine2}
                maxLength={LIMITS.title}
                placeholder="Since 2020"
                helper="Drawn in the accent colour, on its own line."
                onChange={(titleLine2) => onChange({ ...value, titleLine2 })}
            />
            <TextAreaField
                label="Opening Blurb"
                value={value.subtitle}
                maxLength={LIMITS.paragraph}
                rows={4}
                placeholder="What your shop is about, in a sentence or two."
                onChange={(subtitle) => onChange({ ...value, subtitle })}
            />
        </EditorCard>
    );
}

export function ValuesEditor({ value, onChange }: SectionProps<'values'>) {
    const atCap = value.items.length >= LIMITS.values;

    return (
        <EditorCard
            icon={SECTION_META.values.icon}
            title={SECTION_META.values.label}
            hint={`${value.items.length} card${value.items.length === 1 ? '' : 's'}`}
            action={
                <EnabledSwitch
                    label="Value Cards"
                    enabled={value.enabled}
                    onChange={(enabled) => onChange({ ...value, enabled })}
                />
            }
        >
            <TextField
                label="Kicker"
                value={value.eyebrow}
                maxLength={LIMITS.eyebrow}
                placeholder="What We Stand For"
                helper="Optional — both this and the heading start empty."
                onChange={(eyebrow) => onChange({ ...value, eyebrow })}
            />
            <TextField
                label="Section Heading"
                value={value.heading}
                maxLength={LIMITS.heading}
                placeholder="Why people choose us"
                onChange={(heading) => onChange({ ...value, heading })}
            />

            <div className="space-y-3 border-t border-forest-moss/5 pt-5">
                {value.items.map((item, index) => (
                    <RepeatableRow
                        key={index}
                        title={`Card ${index + 1}`}
                        index={index}
                        total={value.items.length}
                        onMove={(from, to) =>
                            onChange({ ...value, items: moveItem(value.items, from, to) })
                        }
                        onRemove={(at) =>
                            onChange({
                                ...value,
                                items: value.items.filter((_, i) => i !== at),
                            })
                        }
                    >
                        <IconPicker
                            label="Icon"
                            value={item.icon}
                            options={CONTENT_ICON_OPTIONS}
                            onChange={(icon) =>
                                onChange({
                                    ...value,
                                    items: value.items.map((row, i) =>
                                        i === index ? { ...row, icon } : row,
                                    ),
                                })
                            }
                        />
                        <TextField
                            label="Title"
                            value={item.title}
                            maxLength={LIMITS.label}
                            placeholder="Sustainable"
                            onChange={(title) =>
                                onChange({
                                    ...value,
                                    items: value.items.map((row, i) =>
                                        i === index ? { ...row, title } : row,
                                    ),
                                })
                            }
                        />
                        <TextAreaField
                            label="Description"
                            value={item.description}
                            maxLength={LIMITS.paragraph}
                            placeholder="What this means for the customer."
                            onChange={(description) =>
                                onChange({
                                    ...value,
                                    items: value.items.map((row, i) =>
                                        i === index ? { ...row, description } : row,
                                    ),
                                })
                            }
                        />
                    </RepeatableRow>
                ))}

                <AddRowButton
                    label="Add Card"
                    disabled={atCap}
                    disabledLabel={`${LIMITS.values} cards is the maximum`}
                    onClick={() =>
                        onChange({
                            ...value,
                            items: [
                                ...value.items,
                                { icon: 'verified', title: '', description: '' },
                            ],
                        })
                    }
                />
                <p className="text-[10px] font-bold text-forest-moss-light/50">
                    Cards sit three to a row. A card left completely blank is dropped when
                    you save.
                </p>
            </div>
        </EditorCard>
    );
}

export function StoryEditor({
    value,
    onChange,
    onUploadingChange,
}: SectionProps<'story'> & { onUploadingChange: (isUploading: boolean) => void }) {
    const atCap = value.paragraphs.length >= LIMITS.paragraphs;

    return (
        <EditorCard
            icon={SECTION_META.story.icon}
            title={SECTION_META.story.label}
            hint={SECTION_META.story.hint}
            action={
                <EnabledSwitch
                    label="Story"
                    enabled={value.enabled}
                    onChange={(enabled) => onChange({ ...value, enabled })}
                />
            }
        >
            <TextField
                label="Kicker"
                value={value.eyebrow}
                maxLength={LIMITS.eyebrow}
                placeholder="Our Journey"
                onChange={(eyebrow) => onChange({ ...value, eyebrow })}
            />
            <TextField
                label="Heading"
                value={value.heading}
                maxLength={LIMITS.heading}
                placeholder="From a Small Workshop to Your Home"
                onChange={(heading) => onChange({ ...value, heading })}
            />

            <div className="space-y-3">
                {value.paragraphs.map((paragraph, index) => (
                    <RepeatableRow
                        key={index}
                        title={`Paragraph ${index + 1}`}
                        index={index}
                        total={value.paragraphs.length}
                        onMove={(from, to) =>
                            onChange({
                                ...value,
                                paragraphs: moveItem(value.paragraphs, from, to),
                            })
                        }
                        onRemove={(at) =>
                            onChange({
                                ...value,
                                paragraphs: value.paragraphs.filter((_, i) => i !== at),
                            })
                        }
                    >
                        <TextAreaField
                            label="Text"
                            value={paragraph}
                            maxLength={LIMITS.paragraph}
                            rows={4}
                            placeholder="Tell the shop's story."
                            onChange={(text) =>
                                onChange({
                                    ...value,
                                    paragraphs: value.paragraphs.map((row, i) =>
                                        i === index ? text : row,
                                    ),
                                })
                            }
                        />
                    </RepeatableRow>
                ))}

                <AddRowButton
                    label="Add Paragraph"
                    disabled={atCap}
                    disabledLabel={`${LIMITS.paragraphs} paragraphs is the maximum`}
                    onClick={() =>
                        onChange({ ...value, paragraphs: [...value.paragraphs, ''] })
                    }
                />
            </div>

            <div className="border-t border-forest-moss/5 pt-5 space-y-5">
                <ProductImagesUploader
                    label="Story Photo"
                    required={false}
                    maxImages={1}
                    images={value.image ? [value.image] : []}
                    onChange={(images) => onChange({ ...value, image: images[0] ?? '' })}
                    onUploadingChange={onUploadingChange}
                />
                <p className="text-[10px] font-bold text-forest-moss-light/50 ml-4 -mt-4">
                    Remove the photo to give the story text the full width.
                </p>

                <TextField
                    label="Photo Description"
                    value={value.imageAlt}
                    maxLength={LIMITS.label}
                    placeholder="Craftsman working on furniture"
                    helper="Read aloud by screen readers and shown if the photo fails to load."
                    onChange={(imageAlt) => onChange({ ...value, imageAlt })}
                />

                <ChoiceField
                    label="Photo Side"
                    value={value.imagePosition}
                    options={[
                        { value: 'left', label: 'Left', icon: 'format_image_left' },
                        { value: 'right', label: 'Right', icon: 'format_image_right' },
                    ]}
                    onChange={(imagePosition) => onChange({ ...value, imagePosition })}
                />
            </div>

            <div className="border-t border-forest-moss/5 pt-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black text-forest-moss uppercase tracking-widest">
                            Floating Badge
                        </p>
                        <p className="text-[10px] font-bold text-forest-moss-light/50 mt-0.5">
                            The small card overlapping the photo's corner.
                        </p>
                    </div>
                    <Switch
                        checked={value.badgeEnabled}
                        ariaLabel="Show the floating badge"
                        onChange={(badgeEnabled) => onChange({ ...value, badgeEnabled })}
                    />
                </div>

                {value.badgeEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-4">
                        <TextField
                            label="Number"
                            value={value.badgeValue}
                            maxLength={LIMITS.badgeValue}
                            placeholder="4+"
                            onChange={(badgeValue) => onChange({ ...value, badgeValue })}
                        />
                        <TextField
                            label="Label"
                            value={value.badgeLabel}
                            maxLength={LIMITS.label}
                            placeholder="Years of Excellence"
                            onChange={(badgeLabel) => onChange({ ...value, badgeLabel })}
                        />
                    </div>
                )}
            </div>
        </EditorCard>
    );
}

export function StatsEditor({ value, onChange }: SectionProps<'stats'>) {
    const atCap = value.items.length >= LIMITS.stats;

    return (
        <EditorCard
            icon={SECTION_META.stats.icon}
            title={SECTION_META.stats.label}
            hint={`${value.items.length} number${value.items.length === 1 ? '' : 's'}`}
            action={
                <EnabledSwitch
                    label="Stats"
                    enabled={value.enabled}
                    onChange={(enabled) => onChange({ ...value, enabled })}
                />
            }
        >
            <div className="space-y-3">
                {value.items.map((item, index) => (
                    <RepeatableRow
                        key={index}
                        title={`Stat ${index + 1}`}
                        index={index}
                        total={value.items.length}
                        onMove={(from, to) =>
                            onChange({ ...value, items: moveItem(value.items, from, to) })
                        }
                        onRemove={(at) =>
                            onChange({
                                ...value,
                                items: value.items.filter((_, i) => i !== at),
                            })
                        }
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-4">
                            <TextField
                                label="Number"
                                value={item.value}
                                maxLength={LIMITS.statValue}
                                placeholder="10K+"
                                onChange={(next) =>
                                    onChange({
                                        ...value,
                                        items: value.items.map((row, i) =>
                                            i === index ? { ...row, value: next } : row,
                                        ),
                                    })
                                }
                            />
                            <TextField
                                label="Label"
                                value={item.label}
                                maxLength={LIMITS.label}
                                placeholder="Happy Customers"
                                onChange={(label) =>
                                    onChange({
                                        ...value,
                                        items: value.items.map((row, i) =>
                                            i === index ? { ...row, label } : row,
                                        ),
                                    })
                                }
                            />
                        </div>
                    </RepeatableRow>
                ))}

                <AddRowButton
                    label="Add Stat"
                    disabled={atCap}
                    disabledLabel={`${LIMITS.stats} stats is the maximum`}
                    onClick={() =>
                        onChange({ ...value, items: [...value.items, { value: '', label: '' }] })
                    }
                />
                <p className="text-[10px] font-bold text-forest-moss-light/50">
                    Four to a row on a desktop, two on a phone.
                </p>
            </div>
        </EditorCard>
    );
}

export function ContactEditor({ value, onChange }: SectionProps<'contact'>) {
    const atCap = value.links.length >= LIMITS.links;

    return (
        <EditorCard
            icon={SECTION_META.contact.icon}
            title={SECTION_META.contact.label}
            hint={`${value.links.length} button${value.links.length === 1 ? '' : 's'}`}
            action={
                <EnabledSwitch
                    label="Contact"
                    enabled={value.enabled}
                    onChange={(enabled) => onChange({ ...value, enabled })}
                />
            }
        >
            <TextField
                label="Heading"
                value={value.heading}
                maxLength={LIMITS.heading}
                placeholder="Get in Touch"
                onChange={(heading) => onChange({ ...value, heading })}
            />
            <TextAreaField
                label="Blurb"
                value={value.subtitle}
                maxLength={LIMITS.paragraph}
                placeholder="How and when customers can reach you."
                onChange={(subtitle) => onChange({ ...value, subtitle })}
            />

            <div className="space-y-3 border-t border-forest-moss/5 pt-5">
                {value.links.map((link, index) => (
                    <RepeatableRow
                        key={index}
                        title={`Button ${index + 1}`}
                        index={index}
                        total={value.links.length}
                        onMove={(from, to) =>
                            onChange({ ...value, links: moveItem(value.links, from, to) })
                        }
                        onRemove={(at) =>
                            onChange({
                                ...value,
                                links: value.links.filter((_, i) => i !== at),
                            })
                        }
                    >
                        <IconPicker
                            label="Icon"
                            value={link.icon}
                            options={CONTENT_ICON_OPTIONS}
                            onChange={(icon) =>
                                onChange({
                                    ...value,
                                    links: value.links.map((row, i) =>
                                        i === index ? { ...row, icon } : row,
                                    ),
                                })
                            }
                        />
                        <TextField
                            label="Button Text"
                            value={link.label}
                            maxLength={LIMITS.label}
                            placeholder="support@yourshop.com"
                            onChange={(label) =>
                                onChange({
                                    ...value,
                                    links: value.links.map((row, i) =>
                                        i === index ? { ...row, label } : row,
                                    ),
                                })
                            }
                        />
                        <TextField
                            label="Destination"
                            value={link.href}
                            maxLength={LIMITS.href}
                            placeholder="mailto:support@yourshop.com"
                            helper="mailto: for email, tel: for a phone number, https:// for a website."
                            onChange={(href) =>
                                onChange({
                                    ...value,
                                    links: value.links.map((row, i) =>
                                        i === index ? { ...row, href } : row,
                                    ),
                                })
                            }
                        />
                        <ChoiceField
                            label="Style"
                            value={link.style}
                            options={[
                                { value: 'subtle', label: 'Subtle' },
                                { value: 'accent', label: 'Accent' },
                            ]}
                            onChange={(style) =>
                                onChange({
                                    ...value,
                                    links: value.links.map((row, i) =>
                                        i === index ? { ...row, style } : row,
                                    ),
                                })
                            }
                        />
                    </RepeatableRow>
                ))}

                <AddRowButton
                    label="Add Button"
                    disabled={atCap}
                    disabledLabel={`${LIMITS.links} buttons is the maximum`}
                    onClick={() =>
                        onChange({
                            ...value,
                            links: [
                                ...value.links,
                                { icon: 'email', label: '', href: '', style: 'subtle' },
                            ],
                        })
                    }
                />
                <p className="text-[10px] font-bold text-forest-moss-light/50">
                    A button with no text or no destination is dropped when you save.
                </p>
            </div>
        </EditorCard>
    );
}

export function BackLinkEditor({ value, onChange }: SectionProps<'backLink'>) {
    return (
        <EditorCard
            icon={SECTION_META.backLink.icon}
            title={SECTION_META.backLink.label}
            hint={SECTION_META.backLink.hint}
            action={
                <EnabledSwitch
                    label="Back Link"
                    enabled={value.enabled}
                    onChange={(enabled) => onChange({ ...value, enabled })}
                />
            }
        >
            <TextField
                label="Link Text"
                value={value.label}
                maxLength={LIMITS.label}
                placeholder="Back to Home"
                helper="Always points at the shop home page."
                onChange={(label) => onChange({ ...value, label })}
            />
        </EditorCard>
    );
}
