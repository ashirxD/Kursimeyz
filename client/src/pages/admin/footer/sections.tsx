import ProductColorPicker from '@/components/ProductColorPicker';
import SocialIcon from '@/components/SocialIcon';
import { SOCIAL_LABELS, SOCIAL_PLATFORMS } from '@/components/socialPlatforms';
import {
    AddRowButton,
    EditorCard,
    RepeatableRow,
    Switch,
    TextAreaField,
    TextField,
} from '@/components/pageEditor/fields';
import type {
    FooterColumn,
    FooterContent,
    FooterLink,
    SocialLink,
    SocialPlatform,
} from '@/hooks/useFooter';
import { moveItem } from '@/utils/reorder';

/**
 * The footer's editors, one card per part of it. Each is a controlled component
 * over the whole content object, so the page above hands down a value and takes
 * back a new one — the parts are small enough that slicing them further would
 * cost more than it saves.
 */

// Mirrors LIMITS in server/utils/footerContent.js. The server clamps regardless;
// matching here means the admin sees the limit instead of losing text on save.
const LIMITS = {
    tagline: 240,
    heading: 30,
    linkLabel: 30,
    href: 400,
    columns: 3,
    linksPerColumn: 6,
    social: 6,
    address: 200,
    phone: 30,
    email: 80,
    hours: 60,
    copyright: 140,
    bottomLinks: 4,
};

// Presets are shortcuts, not limits — every picker still takes any hex.
const SURFACE_PRESETS = ['#1a2f1a', '#3a4d39', '#4b3621', '#111827', '#2b2b2b'];
const ACCENT_PRESETS = ['#ff311b', '#d27d53', '#8a9a5b', '#54b1a4', '#e8ecd7'];
const INK_PRESETS = ['#ffffff', '#f2ece0', '#e8ecd7', '#f4f5f0', '#1a2f1a'];

const HREF_HELPER = "A page on your site like /about, or a full https:// address.";

interface SectionProps {
    value: FooterContent;
    onChange: (value: FooterContent) => void;
}

export function ThemeEditor({ value, onChange }: SectionProps) {
    const setTheme = (theme: Partial<FooterContent['theme']>) =>
        onChange({ ...value, theme: { ...value.theme, ...theme } });

    return (
        <EditorCard
            icon="palette"
            title="Colours"
            hint="The footer's background, accent and text"
            defaultOpen
        >
            <ProductColorPicker
                label="Background"
                value={value.theme.backgroundColor}
                presets={SURFACE_PRESETS}
                onChange={(backgroundColor) => setTheme({ backgroundColor })}
            />
            <ProductColorPicker
                label="Accent"
                value={value.theme.accentColor}
                presets={ACCENT_PRESETS}
                onChange={(accentColor) => setTheme({ accentColor })}
            />
            <ProductColorPicker
                label="Text"
                value={value.theme.textColor}
                presets={INK_PRESETS}
                onChange={(textColor) => setTheme({ textColor })}
            />
            <p className="text-[10px] font-bold text-forest-moss-light/50">
                Headings, link hovers and the contact icons use the accent. Text is drawn
                at a few opacities, so pick one that reads on the background.
            </p>
        </EditorCard>
    );
}

export function BrandEditor({ value, onChange }: SectionProps) {
    const setBrand = (brand: Partial<FooterContent['brand']>) =>
        onChange({ ...value, brand: { ...value.brand, ...brand } });

    return (
        <EditorCard
            icon="storefront"
            title="Brand"
            hint="Your logo and the blurb beside it"
            defaultOpen
            action={
                <div className="flex items-center gap-2">
                    <Switch
                        checked={value.brand.showLogo}
                        ariaLabel="Show the logo in the footer"
                        onChange={(showLogo) => setBrand({ showLogo })}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-forest-moss/40">
                        Logo
                    </span>
                </div>
            }
        >
            <TextAreaField
                label="Tagline"
                value={value.brand.tagline}
                maxLength={LIMITS.tagline}
                rows={4}
                placeholder="What your shop makes, in a sentence or two."
                helper="Leave empty to show just the logo."
                onChange={(tagline) => setBrand({ tagline })}
            />
        </EditorCard>
    );
}

export function CollectionsEditor({ value, onChange }: SectionProps) {
    const setCollections = (collections: Partial<FooterContent['collections']>) =>
        onChange({ ...value, collections: { ...value.collections, ...collections } });

    return (
        <EditorCard
            icon="chair"
            title="Collections Column"
            hint="Links to every kind of product you sell"
            action={
                <Switch
                    checked={value.collections.enabled}
                    ariaLabel="Show the collections column"
                    onChange={(enabled) => setCollections({ enabled })}
                />
            }
        >
            <TextField
                label="Heading"
                value={value.collections.heading}
                maxLength={LIMITS.heading}
                placeholder="Collections"
                onChange={(heading) => setCollections({ heading })}
            />
            <p className="text-[10px] font-bold text-forest-moss-light/50">
                The links are built from your product types, so adding a new kind of
                furniture lists it here automatically — there is nothing to keep in sync.
            </p>
        </EditorCard>
    );
}

export function ColumnsEditor({ value, onChange }: SectionProps) {
    const setColumns = (columns: FooterColumn[]) => onChange({ ...value, columns });

    const updateColumn = (index: number, column: FooterColumn) =>
        setColumns(value.columns.map((item, i) => (i === index ? column : item)));

    return (
        <EditorCard
            icon="list"
            title="Link Columns"
            hint="Your own columns of links, e.g. Company or Help"
            defaultOpen
        >
            <div className="space-y-3">
                {value.columns.map((column, index) => (
                    <RepeatableRow
                        key={index}
                        title={column.heading || `Column ${index + 1}`}
                        index={index}
                        total={value.columns.length}
                        onMove={(from, to) => setColumns(moveItem(value.columns, from, to))}
                        onRemove={(target) =>
                            setColumns(value.columns.filter((_, i) => i !== target))
                        }
                    >
                        <TextField
                            label="Heading"
                            value={column.heading}
                            maxLength={LIMITS.heading}
                            placeholder="Company"
                            onChange={(heading) => updateColumn(index, { ...column, heading })}
                        />

                        <LinkListEditor
                            links={column.links}
                            maxLinks={LIMITS.linksPerColumn}
                            onChange={(links) => updateColumn(index, { ...column, links })}
                        />
                    </RepeatableRow>
                ))}
            </div>

            <AddRowButton
                label="Add column"
                disabled={value.columns.length >= LIMITS.columns}
                disabledLabel={`${LIMITS.columns} columns is the maximum`}
                onClick={() => setColumns([...value.columns, { heading: '', links: [] }])}
            />
        </EditorCard>
    );
}

export function ContactEditor({ value, onChange }: SectionProps) {
    const setContact = (contact: Partial<FooterContent['contact']>) =>
        onChange({ ...value, contact: { ...value.contact, ...contact } });

    return (
        <EditorCard
            icon="alternate_email"
            title="Contact"
            hint="Where customers can reach you"
            defaultOpen
            action={
                <Switch
                    checked={value.contact.enabled}
                    ariaLabel="Show the contact column"
                    onChange={(enabled) => setContact({ enabled })}
                />
            }
        >
            <TextField
                label="Heading"
                value={value.contact.heading}
                maxLength={LIMITS.heading}
                placeholder="Get in Touch"
                onChange={(heading) => setContact({ heading })}
            />
            <TextAreaField
                label="Shop Address"
                value={value.contact.address}
                maxLength={LIMITS.address}
                rows={3}
                placeholder={`Shop 12, Main Boulevard\nGulberg III, Lahore\nPunjab, Pakistan`}
                helper="Put each part on its own line — the footer keeps the line breaks."
                onChange={(address) => setContact({ address })}
            />
            <TextField
                label="Map Link"
                value={value.contact.mapUrl}
                maxLength={LIMITS.href}
                placeholder="https://maps.app.goo.gl/..."
                helper="Optional. Adds a 'Get directions' link under the address."
                onChange={(mapUrl) => setContact({ mapUrl })}
            />
            <TextField
                label="Phone"
                value={value.contact.phone}
                maxLength={LIMITS.phone}
                placeholder="+92 321 1411478"
                helper="Shown as a tap-to-call link."
                onChange={(phone) => setContact({ phone })}
            />
            <TextField
                label="Email"
                value={value.contact.email}
                maxLength={LIMITS.email}
                placeholder="hello@kursimeyz.com"
                helper="Shown as a tap-to-email link."
                onChange={(email) => setContact({ email })}
            />
            <TextField
                label="Opening Hours"
                value={value.contact.hours}
                maxLength={LIMITS.hours}
                placeholder="Mon – Sat, 10am – 8pm"
                onChange={(hours) => setContact({ hours })}
            />
            <p className="text-[10px] font-bold text-forest-moss-light/50">
                Any line you leave empty is left out of the footer.
            </p>
        </EditorCard>
    );
}

export function SocialEditor({ value, onChange }: SectionProps) {
    const setSocial = (social: Partial<FooterContent['social']>) =>
        onChange({ ...value, social: { ...value.social, ...social } });

    const setItems = (items: SocialLink[]) => setSocial({ items });

    const updateItem = (index: number, item: SocialLink) =>
        setItems(value.social.items.map((current, i) => (i === index ? item : current)));

    return (
        <EditorCard
            icon="share"
            title="Social Links"
            hint="The profiles shown under your tagline"
            action={
                <Switch
                    checked={value.social.enabled}
                    ariaLabel="Show the social links"
                    onChange={(enabled) => setSocial({ enabled })}
                />
            }
        >
            <div className="space-y-3">
                {value.social.items.map((item, index) => (
                    <RepeatableRow
                        key={index}
                        title={SOCIAL_LABELS[item.platform]}
                        index={index}
                        total={value.social.items.length}
                        onMove={(from, to) => setItems(moveItem(value.social.items, from, to))}
                        onRemove={(target) =>
                            setItems(value.social.items.filter((_, i) => i !== target))
                        }
                    >
                        <div className="space-y-1.5">
                            <span className="block text-[10px] font-black text-forest-moss uppercase tracking-widest">
                                Network
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {SOCIAL_PLATFORMS.map((platform: SocialPlatform) => (
                                    <button
                                        key={platform}
                                        type="button"
                                        title={SOCIAL_LABELS[platform]}
                                        aria-label={SOCIAL_LABELS[platform]}
                                        onClick={() => updateItem(index, { ...item, platform })}
                                        className={`size-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                                            item.platform === platform
                                                ? 'bg-forest-moss border-forest-moss text-white shadow-soft'
                                                : 'bg-white border-forest-moss/10 text-forest-moss/40 hover:text-forest-moss'
                                        }`}
                                    >
                                        <SocialIcon platform={platform} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <TextField
                            label="Profile Link"
                            value={item.href}
                            maxLength={LIMITS.href}
                            placeholder="https://instagram.com/yourshop"
                            helper="A link is needed — an icon with nowhere to go is dropped on save."
                            onChange={(href) => updateItem(index, { ...item, href })}
                        />
                    </RepeatableRow>
                ))}
            </div>

            <AddRowButton
                label="Add social link"
                disabled={value.social.items.length >= LIMITS.social}
                disabledLabel={`${LIMITS.social} links is the maximum`}
                onClick={() =>
                    setItems([...value.social.items, { platform: 'instagram', href: '' }])
                }
            />
        </EditorCard>
    );
}

export function BottomBarEditor({ value, onChange }: SectionProps) {
    const setBottom = (bottom: Partial<FooterContent['bottom']>) =>
        onChange({ ...value, bottom: { ...value.bottom, ...bottom } });

    return (
        <EditorCard
            icon="copyright"
            title="Bottom Bar"
            hint="The copyright line and any policy links"
        >
            <TextField
                label="Copyright"
                value={value.bottom.copyright}
                maxLength={LIMITS.copyright}
                placeholder="© {year} Kursimeyz. All rights reserved."
                helper="Type {year} where the current year should go — it updates itself."
                onChange={(copyright) => setBottom({ copyright })}
            />

            <LinkListEditor
                links={value.bottom.links}
                maxLinks={LIMITS.bottomLinks}
                label="Bottom Links"
                onChange={(links) => setBottom({ links })}
            />
        </EditorCard>
    );
}

/** The list of label/href pairs used by both the columns and the bottom bar. */
function LinkListEditor({
    links,
    maxLinks,
    label = 'Links',
    onChange,
}: {
    links: FooterLink[];
    maxLinks: number;
    label?: string;
    onChange: (links: FooterLink[]) => void;
}) {
    const updateLink = (index: number, link: FooterLink) =>
        onChange(links.map((current, i) => (i === index ? link : current)));

    return (
        <div className="space-y-2">
            <span className="block text-[10px] font-black text-forest-moss uppercase tracking-widest">
                {label}
            </span>

            {links.map((link, index) => (
                <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-2 items-start sm:items-center"
                >
                    <input
                        type="text"
                        value={link.label}
                        maxLength={LIMITS.linkLabel}
                        placeholder="Label"
                        onChange={(e) => updateLink(index, { ...link, label: e.target.value })}
                        className="w-full sm:w-2/5 bg-white px-3 py-2.5 rounded-xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/20 transition-all font-bold text-sm placeholder:text-forest-moss/30 text-forest-moss"
                    />
                    <input
                        type="text"
                        value={link.href}
                        maxLength={LIMITS.href}
                        placeholder="/about"
                        title={HREF_HELPER}
                        onChange={(e) => updateLink(index, { ...link, href: e.target.value })}
                        className="w-full sm:flex-1 bg-white px-3 py-2.5 rounded-xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/20 transition-all font-bold text-sm placeholder:text-forest-moss/30 text-forest-moss"
                    />
                    <button
                        type="button"
                        title="Remove link"
                        aria-label={`Remove ${link.label || 'link'}`}
                        onClick={() => onChange(links.filter((_, i) => i !== index))}
                        className="size-9 shrink-0 rounded-xl bg-white border border-forest-moss/10 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                    >
                        <span className="material-symbols-outlined !text-sm">delete</span>
                    </button>
                </div>
            ))}

            <AddRowButton
                label="Add link"
                disabled={links.length >= maxLinks}
                disabledLabel={`${maxLinks} links is the maximum`}
                onClick={() => onChange([...links, { label: '', href: '' }])}
            />

            <p className="text-[10px] font-bold text-forest-moss-light/50">{HREF_HELPER}</p>
        </div>
    );
}
