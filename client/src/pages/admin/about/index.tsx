import { useState } from 'react';
import { AxiosError } from 'axios';
import AboutContent from '@/components/AboutContent';
import LoadingSpinner from '@/components/LoadingSpinner';
import Header from '@/pages/admin/layout/Header';
import {
    useAboutPage,
    useAboutPageEditor,
    type AboutPageContent,
    type AboutSectionKey,
} from '@/hooks/useAboutPage';
import { moveItem } from '@/utils/reorder';
import { Switch } from '@/components/pageEditor/fields';
import { SECTION_META } from './meta';
import {
    BackLinkEditor,
    ContactEditor,
    HeroEditor,
    StatsEditor,
    StoryEditor,
    ThemeEditor,
    ValuesEditor,
} from './sections';

/**
 * Admin editor for the storefront About page.
 *
 * The Preview tab renders the same AboutContent component the public page does,
 * fed the unsaved draft — so what the admin checks before saving is the real
 * page, not an approximation of it.
 */
export default function AdminAboutPage() {
    const { content, isLoading, error } = useAboutPage();

    return (
        <div className="flex-1 flex flex-col gap-4 px-0 md:px-2 pb-6">
            <Header />

            <div className="flex flex-col gap-6 px-4 md:px-2">
                <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-black text-forest-moss tracking-tight">
                        About Page
                    </h2>
                    <p className="text-forest-moss-light/70 font-bold text-xs md:text-sm">
                        Write the copy, pick the colours and icons, and choose which sections
                        customers see.
                    </p>
                </div>

                {isLoading && <LoadingSpinner />}

                {!isLoading && (error || !content) && (
                    <div className="bg-white rounded-3xl shadow-soft p-8 border border-white/50 text-center">
                        <span className="material-symbols-outlined !text-5xl text-red-300 mb-2">
                            error
                        </span>
                        <p className="text-forest-moss font-black">
                            Could not load the About page
                        </p>
                        <p className="text-forest-moss-light/60 font-bold text-xs mt-1">
                            Refresh to try again.
                        </p>
                    </div>
                )}

                {/* Mounted only once loaded, so the draft seeds from real content at
                    mount instead of being synced in an effect. */}
                {!isLoading && content && <AboutEditor initialContent={content} />}
            </div>
        </div>
    );
}

type Tab = 'edit' | 'preview';

// A typed lookup beats a generic setter here: every entry is checked against the
// real section shape, so a rename cannot silently produce an untyped patch.
const SECTION_TOGGLES: Record<
    AboutSectionKey,
    (content: AboutPageContent, enabled: boolean) => AboutPageContent
> = {
    hero: (content, enabled) => ({ ...content, hero: { ...content.hero, enabled } }),
    values: (content, enabled) => ({ ...content, values: { ...content.values, enabled } }),
    story: (content, enabled) => ({ ...content, story: { ...content.story, enabled } }),
    stats: (content, enabled) => ({ ...content, stats: { ...content.stats, enabled } }),
    contact: (content, enabled) => ({ ...content, contact: { ...content.contact, enabled } }),
    backLink: (content, enabled) => ({
        ...content,
        backLink: { ...content.backLink, enabled },
    }),
};

const isSectionEnabled = (content: AboutPageContent, key: AboutSectionKey) =>
    content[key].enabled;

const clone = (content: AboutPageContent): AboutPageContent =>
    JSON.parse(JSON.stringify(content));

function AboutEditor({ initialContent }: { initialContent: AboutPageContent }) {
    const { save, isSaving, reset, isResetting } = useAboutPageEditor();

    const [draft, setDraft] = useState<AboutPageContent>(() => clone(initialContent));
    // Compared as JSON rather than by reference: every edit rebuilds its slice, so
    // reference equality would report changes the admin has since undone by hand.
    const [savedJson, setSavedJson] = useState(() => JSON.stringify(initialContent));
    const [tab, setTab] = useState<Tab>('edit');
    const [isUploading, setIsUploading] = useState(false);
    const [confirmingReset, setConfirmingReset] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
        null,
    );

    const isDirty = JSON.stringify(draft) !== savedJson;
    const isBusy = isSaving || isResetting || isUploading;

    const accept = (saved: AboutPageContent, text: string) => {
        // The server prunes blank rows and clamps long text, so the editor adopts
        // what was actually stored rather than keeping its own optimistic copy.
        setDraft(clone(saved));
        setSavedJson(JSON.stringify(saved));
        setMessage({ type: 'success', text });
    };

    const reportFailure = (failure: unknown, fallback: string) => {
        const detail =
            failure instanceof AxiosError
                ? (failure.response?.data as { message?: string } | undefined)?.message
                : undefined;
        setMessage({ type: 'error', text: detail || fallback });
    };

    const handleSave = async () => {
        setMessage(null);

        try {
            accept(await save(draft), 'About page updated. Customers see it now.');
        } catch (failure) {
            reportFailure(failure, 'Could not save the About page.');
        }
    };

    const handleReset = async () => {
        setMessage(null);
        setConfirmingReset(false);

        try {
            accept(await reset(), 'About page restored to the original content.');
        } catch (failure) {
            reportFailure(failure, 'Could not reset the About page.');
        }
    };

    const nothingVisible = draft.sectionOrder.every((key) => !isSectionEnabled(draft, key));

    return (
        <div className="space-y-5">
            {/* Sticks to the top of the admin scroll area, so Save stays reachable
                however far down the form the admin is. */}
            <div className="sticky top-0 z-10 -mx-1 px-1 py-3 bg-oatmeal/90 backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-white rounded-full p-1 shadow-soft border border-white/50">
                        {(['edit', 'preview'] as Tab[]).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setTab(option)}
                                className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                                    tab === option
                                        ? 'bg-forest-moss text-white shadow-soft'
                                        : 'text-forest-moss/50 hover:text-forest-moss'
                                }`}
                            >
                                {option === 'edit' ? 'Edit' : 'Preview'}
                            </button>
                        ))}
                    </div>

                    {isDirty && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-clay">
                            <span className="size-1.5 rounded-full bg-clay" />
                            Unsaved changes
                        </span>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                        <a
                            href="/about"
                            target="_blank"
                            rel="noreferrer"
                            title="Open the live page in a new tab"
                            className="size-10 rounded-full bg-white shadow-soft border border-white/50 flex items-center justify-center text-forest-moss/60 hover:text-forest-moss transition-all"
                        >
                            <span className="material-symbols-outlined !text-lg">open_in_new</span>
                        </a>

                        {confirmingReset ? (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmingReset(false)}
                                    className="px-4 py-2.5 rounded-full bg-white border border-forest-moss/10 text-forest-moss font-black text-[11px] uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={isBusy}
                                    className="px-4 py-2.5 rounded-full bg-red-500 text-white font-black text-[11px] uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
                                >
                                    Discard everything
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setConfirmingReset(true)}
                                disabled={isBusy}
                                title="Restore the original content"
                                className="px-4 py-2.5 rounded-full bg-white shadow-soft border border-white/50 text-forest-moss/60 font-black text-[11px] uppercase tracking-widest hover:text-forest-moss transition-all disabled:opacity-50"
                            >
                                Reset
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isBusy || !isDirty}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest-moss text-white font-black text-[11px] uppercase tracking-widest shadow-medium hover:bg-forest-moss-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <span className="animate-spin rounded-full size-3.5 border-2 border-white/40 border-t-white" />
                                    Saving
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined !text-lg">save</span>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {confirmingReset && (
                    <p className="text-[11px] font-bold text-red-500 mt-2">
                        This throws away every edit and puts the original About page back.
                    </p>
                )}
            </div>

            {message && (
                <div
                    className={`p-4 rounded-2xl flex items-center gap-3 ${
                        message.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                    }`}
                >
                    <span className="material-symbols-outlined">
                        {message.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span className="text-sm font-bold">{message.text}</span>
                </div>
            )}

            {tab === 'edit' ? (
                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(300px,340px)] gap-5 items-start">
                    <div className="space-y-4 min-w-0">
                        <ThemeEditor
                            value={draft.theme}
                            onChange={(theme) => setDraft((current) => ({ ...current, theme }))}
                        />

                        {/* Editors follow the admin's own section order, so the form reads
                            top-to-bottom the same way the page does. */}
                        {draft.sectionOrder.map((key) => {
                            switch (key) {
                                case 'hero':
                                    return (
                                        <HeroEditor
                                            key={key}
                                            value={draft.hero}
                                            onChange={(hero) =>
                                                setDraft((current) => ({ ...current, hero }))
                                            }
                                        />
                                    );
                                case 'values':
                                    return (
                                        <ValuesEditor
                                            key={key}
                                            value={draft.values}
                                            onChange={(values) =>
                                                setDraft((current) => ({ ...current, values }))
                                            }
                                        />
                                    );
                                case 'story':
                                    return (
                                        <StoryEditor
                                            key={key}
                                            value={draft.story}
                                            onUploadingChange={setIsUploading}
                                            onChange={(story) =>
                                                setDraft((current) => ({ ...current, story }))
                                            }
                                        />
                                    );
                                case 'stats':
                                    return (
                                        <StatsEditor
                                            key={key}
                                            value={draft.stats}
                                            onChange={(stats) =>
                                                setDraft((current) => ({ ...current, stats }))
                                            }
                                        />
                                    );
                                case 'contact':
                                    return (
                                        <ContactEditor
                                            key={key}
                                            value={draft.contact}
                                            onChange={(contact) =>
                                                setDraft((current) => ({ ...current, contact }))
                                            }
                                        />
                                    );
                                case 'backLink':
                                    return (
                                        <BackLinkEditor
                                            key={key}
                                            value={draft.backLink}
                                            onChange={(backLink) =>
                                                setDraft((current) => ({ ...current, backLink }))
                                            }
                                        />
                                    );
                                default:
                                    return null;
                            }
                        })}
                    </div>

                    <SectionOrderPanel
                        content={draft}
                        onReorder={(sectionOrder) =>
                            setDraft((current) => ({ ...current, sectionOrder }))
                        }
                        onToggle={(key, enabled) =>
                            setDraft((current) => SECTION_TOGGLES[key](current, enabled))
                        }
                    />
                </div>
            ) : (
                <div>
                    {nothingVisible && (
                        <div className="mb-4 p-4 rounded-2xl bg-clay-soft/60 border border-clay/20 flex items-center gap-3">
                            <span className="material-symbols-outlined text-clay">
                                visibility_off
                            </span>
                            <span className="text-xs font-bold text-forest-moss">
                                Every section is switched off, so customers would see an empty
                                page.
                            </span>
                        </div>
                    )}

                    {/* Mirrors the storefront layout's container, so widths and padding
                        in the preview match what visitors get. */}
                    <div className="rounded-3xl bg-white border border-white/50 shadow-soft overflow-hidden">
                        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
                            <AboutContent content={draft} isPreview />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface SectionOrderPanelProps {
    content: AboutPageContent;
    onReorder: (order: AboutSectionKey[]) => void;
    onToggle: (key: AboutSectionKey, enabled: boolean) => void;
}

/** Drag or arrow the sections into order, and switch any of them off. */
function SectionOrderPanel({ content, onReorder, onToggle }: SectionOrderPanelProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const order = content.sectionOrder;

    const arrowButton =
        'size-6 rounded-full bg-oatmeal/60 flex items-center justify-center text-forest-moss/50 hover:text-forest-moss transition-all disabled:opacity-25 disabled:cursor-not-allowed';

    return (
        <div className="bg-white rounded-3xl shadow-soft border border-white/50 p-5 md:p-6 xl:sticky xl:top-24">
            <div className="flex items-center gap-3 mb-4">
                <div className="size-11 shrink-0 rounded-2xl bg-oatmeal/60 flex items-center justify-center">
                    <span className="material-symbols-outlined !text-2xl text-forest-moss">
                        reorder
                    </span>
                </div>
                <div>
                    <h3 className="text-base font-black text-forest-moss tracking-tight">
                        Page Order
                    </h3>
                    <p className="text-forest-moss-light/60 font-bold text-[11px]">
                        Drag to rearrange, switch to hide
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {order.map((key, index) => {
                    const meta = SECTION_META[key];
                    const enabled = isSectionEnabled(content, key);

                    return (
                        <div
                            key={key}
                            draggable
                            onDragStart={() => setDraggedIndex(index)}
                            onDragEnd={() => setDraggedIndex(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (draggedIndex !== null) {
                                    onReorder(moveItem(order, draggedIndex, index));
                                }
                                setDraggedIndex(null);
                            }}
                            className={`flex items-center gap-2 p-2.5 rounded-2xl border transition-all cursor-grab active:cursor-grabbing ${
                                enabled
                                    ? 'bg-oatmeal/30 border-forest-moss/10'
                                    : 'bg-oatmeal/10 border-dashed border-forest-moss/10'
                            } ${draggedIndex === index ? 'opacity-40' : ''}`}
                        >
                            <span className="material-symbols-outlined !text-base text-forest-moss/25">
                                drag_indicator
                            </span>

                            <span
                                className={`material-symbols-outlined !text-lg ${
                                    enabled ? 'text-forest-moss/60' : 'text-forest-moss/25'
                                }`}
                            >
                                {meta.icon}
                            </span>

                            <span
                                className={`flex-1 min-w-0 truncate text-[11px] font-black uppercase tracking-widest ${
                                    enabled ? 'text-forest-moss' : 'text-forest-moss/35'
                                }`}
                            >
                                {meta.label}
                            </span>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    title="Move up"
                                    disabled={index === 0}
                                    onClick={() => onReorder(moveItem(order, index, index - 1))}
                                    className={arrowButton}
                                >
                                    <span className="material-symbols-outlined !text-sm">
                                        keyboard_arrow_up
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    title="Move down"
                                    disabled={index === order.length - 1}
                                    onClick={() => onReorder(moveItem(order, index, index + 1))}
                                    className={arrowButton}
                                >
                                    <span className="material-symbols-outlined !text-sm">
                                        keyboard_arrow_down
                                    </span>
                                </button>
                            </div>

                            <Switch
                                checked={enabled}
                                ariaLabel={`Show the ${meta.label} section`}
                                onChange={(next) => onToggle(key, next)}
                            />
                        </div>
                    );
                })}
            </div>

            <p className="text-[10px] font-bold text-forest-moss-light/50 mt-4">
                The editor cards on the left follow this order too.
            </p>
        </div>
    );
}
