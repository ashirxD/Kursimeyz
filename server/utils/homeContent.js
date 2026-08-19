// The dashboard hero — the first thing a visitor sees — is admin-authored: its
// kicker, headline lines, blurb, button, photo and hover badges all come from a
// single settings document.
//
// Same contract as utils/aboutContent.js: the defaults below reproduce the
// hand-written hero exactly, and normalizeHomeContent runs on reads as well as
// writes, so the client is always handed a complete object.

const {
    asObject,
    pickBoolean,
    pickColor,
    pickHref,
    pickIcon,
    pickImage,
    pickList,
    pickOneOf,
    pickParagraph,
    pickString,
} = require('./contentFields');

/** Which corner of the photo a hover badge sits in. */
const BADGE_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

/** What the button does: scroll to the collections grid, or follow a link. */
const CTA_ACTIONS = ['scroll', 'link'];

// Lifted verbatim from the hand-written hero, so an untouched shop looks exactly
// as it did before the feature landed.
const DEFAULT_HOME_CONTENT = {
    hero: {
        enabled: true,
        kicker: {
            text: 'New Collection 2026',
            dotColor: '#ff6b35',
            // Drawn at 40% opacity, matching the original design.
            textColor: '#1a2f1a',
        },
        // One line each, stacked, every line its own colour.
        headlineLines: [
            { text: 'Sit Back.', color: '#1a2f1a' },
            { text: 'Breathe.', color: '#d27d53' },
            { text: 'Belong.', color: '#ff6b35' },
        ],
        subtitle:
            'Handcrafted chairs designed for your peace of mind. Experience comfort that connects you back to nature.',
        // Drawn at 50% opacity.
        subtitleColor: '#1a2f1a',
        cta: {
            enabled: true,
            label: 'Shop Collection',
            icon: 'arrow_forward',
            action: 'scroll',
            // Only used when action is 'link'.
            href: '',
            backgroundColor: '#ff6b35',
            // Explicit rather than derived: the original is white on orange, which
            // auto-contrast would have flipped to dark.
            textColor: '#ffffff',
        },
        image: {
            url: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&q=80&w=1500',
            alt: 'Minimalist Interior Decor',
            // The tilted panel peeking out behind the photo.
            backdropColor: '#f8fafc',
        },
        badges: {
            enabled: true,
            // Each badge tints its own pill from `color`; they fade in on hover.
            items: [
                { icon: 'eco', color: '#ffffff', position: 'top-left' },
                { icon: 'nest_eco_leaf', color: '#d27d53', position: 'bottom-right' },
            ],
        },
    },
};

// Caps exist so one paste of a novel cannot break the layout for every visitor.
const LIMITS = {
    kicker: 60,
    headline: 40,
    headlineLines: 4,
    subtitle: 400,
    ctaLabel: 40,
    href: 400,
    image: 500,
    alt: 120,
    badges: 4,
};

const normalizeHomeContent = (body) => {
    const source = asObject(body);
    const defaults = DEFAULT_HOME_CONTENT;

    const hero = asObject(source.hero);
    const kicker = asObject(hero.kicker);
    const cta = asObject(hero.cta);
    const image = asObject(hero.image);
    const badges = asObject(hero.badges);

    const defaultHero = defaults.hero;
    const defaultLine = defaultHero.headlineLines[0];
    const defaultBadge = defaultHero.badges.items[0];

    return {
        hero: {
            enabled: pickBoolean(hero.enabled, defaultHero.enabled),
            kicker: {
                text: pickString(kicker.text, defaultHero.kicker.text, LIMITS.kicker),
                dotColor: pickColor(kicker.dotColor, defaultHero.kicker.dotColor),
                textColor: pickColor(kicker.textColor, defaultHero.kicker.textColor),
            },
            headlineLines: pickList({
                value: hero.headlineLines,
                fallback: defaultHero.headlineLines,
                maxItems: LIMITS.headlineLines,
                mapItem: (line) => ({
                    text: pickString(line.text, '', LIMITS.headline),
                    color: pickColor(line.color, defaultLine.color),
                }),
                // A line with nothing on it would just add blank vertical space.
                isEmpty: (line) => line.text === '',
            }),
            subtitle: pickParagraph(hero.subtitle, defaultHero.subtitle, LIMITS.subtitle),
            subtitleColor: pickColor(hero.subtitleColor, defaultHero.subtitleColor),
            cta: {
                enabled: pickBoolean(cta.enabled, defaultHero.cta.enabled),
                label: pickString(cta.label, defaultHero.cta.label, LIMITS.ctaLabel),
                icon: pickIcon(cta.icon, defaultHero.cta.icon),
                action: pickOneOf(cta.action, CTA_ACTIONS, defaultHero.cta.action),
                href: pickHref(cta.href, defaultHero.cta.href, LIMITS.href),
                backgroundColor: pickColor(
                    cta.backgroundColor,
                    defaultHero.cta.backgroundColor
                ),
                textColor: pickColor(cta.textColor, defaultHero.cta.textColor),
            },
            image: {
                url: pickImage(image.url, defaultHero.image.url, LIMITS.image),
                alt: pickString(image.alt, defaultHero.image.alt, LIMITS.alt),
                backdropColor: pickColor(
                    image.backdropColor,
                    defaultHero.image.backdropColor
                ),
            },
            badges: {
                enabled: pickBoolean(badges.enabled, defaultHero.badges.enabled),
                items: pickList({
                    value: badges.items,
                    fallback: defaultHero.badges.items,
                    maxItems: LIMITS.badges,
                    mapItem: (badge) => ({
                        icon: pickIcon(badge.icon, defaultBadge.icon),
                        color: pickColor(badge.color, defaultBadge.color),
                        position: pickOneOf(
                            badge.position,
                            BADGE_POSITIONS,
                            defaultBadge.position
                        ),
                    }),
                    // Every badge has a usable icon by construction, so none are blank.
                    isEmpty: () => false,
                }),
            },
        },
    };
};

module.exports = {
    BADGE_POSITIONS,
    CTA_ACTIONS,
    DEFAULT_HOME_CONTENT,
    normalizeHomeContent,
};
