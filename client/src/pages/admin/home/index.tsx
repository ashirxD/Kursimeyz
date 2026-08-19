import { useState } from 'react';
import { AxiosError } from 'axios';
import HomeHero from '@/components/HomeHero';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Switch } from '@/components/pageEditor/fields';
import Header from '@/pages/admin/layout/Header';
import {
    useHomePage,
    useHomePageEditor,
    type HomePageContent,
} from '@/hooks/useHomePage';
import {
    BadgesEditor,
    BlurbEditor,
    CtaEditor,
    HeadlineEditor,
    ImageEditor,
    KickerEditor,
} from './sections';

/**
 * Admin editor for the dashboard hero — the first thing a visitor sees.
 *
 * The Preview tab renders the same HomeHero component the storefront does, fed
 * the unsaved draft, so what the admin checks before saving is the real hero.
 */
export default function AdminHomePage() {
    const { content, isLoading, error } = useHomePage();

    return (
        <div className="flex-1 flex flex-col gap-4 px-0 md:px-2 pb-6">
            <Header />

            <div className="flex flex-col gap-6 px-4 md:px-2">
                <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-black text-forest-moss tracking-tight">
                        Home Hero
                    </h2>
                    <p className="text-forest-moss-light/70 font-bold text-xs md:text-sm">
                        The banner at the top of your shop's home page — its words, colours,
                        button and photo.
                    </p>
                </div>

                {isLoading && <LoadingSpinner />}

                {!isLoading && (error || !content) && (
                    <div className="bg-white rounded-3xl shadow-soft p-8 border border-white/50 text-center">
                        <span className="material-symbols-outlined !text-5xl text-red-300 mb-2">
                            error
                        </span>
                        <p className="text-forest-moss font-black">Could not load the hero</p>
                        <p className="text-forest-moss-light/60 font-bold text-xs mt-1">
                            Refresh to try again.
                        </p>
                    </div>
                )}

                {/* Mounted only once loaded, so the draft seeds from real content at
                    mount instead of being synced in an effect. */}
                {!isLoading && content && <HeroEditor initialContent={content} />}
            </div>
        </div>
    );
}

type Tab = 'edit' | 'preview';

const clone = (content: HomePageContent): HomePageContent =>
    JSON.parse(JSON.stringify(content));

function HeroEditor({ initialContent }: { initialContent: HomePageContent }) {
    const { save, isSaving, reset, isResetting } = useHomePageEditor();

    const [draft, setDraft] = useState<HomePageContent>(() => clone(initialContent));
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

    const setHero = (hero: HomePageContent['hero']) =>
        setDraft((current) => ({ ...current, hero }));

    const accept = (saved: HomePageContent, text: string) => {
        // The server drops blank lines and clamps long text, so the editor adopts
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
            accept(await save(draft), 'Home hero updated. Visitors see it now.');
        } catch (failure) {
            reportFailure(failure, 'Could not save the hero.');
        }
    };

    const handleReset = async () => {
        setMessage(null);
        setConfirmingReset(false);

        try {
            accept(await reset(), 'Home hero restored to the original content.');
        } catch (failure) {
            reportFailure(failure, 'Could not reset the hero.');
        }
    };

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

                    <div className="flex items-center gap-2">
                        <Switch
                            checked={draft.hero.enabled}
                            ariaLabel="Show the hero on the home page"
                            onChange={(enabled) => setHero({ ...draft.hero, enabled })}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-forest-moss/50">
                            {draft.hero.enabled ? 'Visible' : 'Hidden'}
                        </span>
                    </div>

                    {isDirty && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-clay">
                            <span className="size-1.5 rounded-full bg-clay" />
                            Unsaved changes
                        </span>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                        <a
                            href="/"
                            target="_blank"
                            rel="noreferrer"
                            title="Open the live home page in a new tab"
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
                                title="Restore the original hero"
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
                        This throws away every edit and puts the original hero back.
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

            {!draft.hero.enabled && (
                <div className="p-4 rounded-2xl bg-clay-soft/60 border border-clay/20 flex items-center gap-3">
                    <span className="material-symbols-outlined text-clay">visibility_off</span>
                    <span className="text-xs font-bold text-forest-moss">
                        The hero is switched off, so the home page starts at Top Picks. Your
                        edits are still saved.
                    </span>
                </div>
            )}

            {tab === 'edit' ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                    <div className="space-y-4 min-w-0">
                        <KickerEditor value={draft.hero} onChange={setHero} />
                        <HeadlineEditor value={draft.hero} onChange={setHero} />
                        <BlurbEditor value={draft.hero} onChange={setHero} />
                    </div>
                    <div className="space-y-4 min-w-0">
                        <CtaEditor value={draft.hero} onChange={setHero} />
                        <ImageEditor
                            value={draft.hero}
                            onChange={setHero}
                            onUploadingChange={setIsUploading}
                        />
                        <BadgesEditor value={draft.hero} onChange={setHero} />
                    </div>
                </div>
            ) : (
                /* Mirrors the storefront layout's container, so widths and padding in
                   the preview match what visitors get. */
                <div className="rounded-3xl bg-white border border-white/50 shadow-soft overflow-hidden">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-16 pb-12">
                        <HomeHero hero={draft.hero} isPreview />
                    </div>
                </div>
            )}
        </div>
    );
}
