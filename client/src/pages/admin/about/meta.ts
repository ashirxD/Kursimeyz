import type { AboutSectionKey } from '@/hooks/useAboutPage';

/** How each section is labelled in the editor's card headers and order panel. */
export const SECTION_META: Record<
    AboutSectionKey,
    { label: string; icon: string; hint: string }
> = {
    hero: { label: 'Hero', icon: 'title', hint: 'Kicker, headline and opening blurb' },
    values: { label: 'Value Cards', icon: 'grid_view', hint: 'The icon cards row' },
    story: { label: 'Story', icon: 'auto_stories', hint: 'Text, photo and floating badge' },
    stats: { label: 'Stats', icon: 'insights', hint: 'The numbers strip' },
    contact: { label: 'Contact', icon: 'alternate_email', hint: 'Panel and contact buttons' },
    backLink: { label: 'Back Link', icon: 'arrow_back', hint: 'The link home at the bottom' },
};
