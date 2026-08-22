// The storefront footer is admin-authored: its blurb, link columns, contact
// details, social profiles and colours all come from a single settings document.
//
// Same contract as utils/homeContent.js and utils/aboutContent.js — the defaults
// below are what an untouched shop shows, and normalizeFooterContent runs on
// reads as well as writes, so the client is always handed a complete object.

const {
    asObject,
    pickBoolean,
    pickColor,
    pickHref,
    pickList,
    pickOneOf,
    pickParagraph,
    pickString,
} = require('./contentFields');

/** Networks the footer can link to. Each one draws its own brand mark. */
const SOCIAL_PLATFORMS = [
    'whatsapp',
    'facebook',
    'instagram',
    'tiktok',
    'youtube',
    'pinterest',
    'linkedin',
    'x',
];

const DEFAULT_FOOTER_CONTENT = {
    enabled: true,
    theme: {
        backgroundColor: '#1a2f1a',
        // Headings, hover states and the contact glyphs.
        accentColor: '#ff6b35',
        // Everything else, drawn at a few different opacities.
        textColor: '#ffffff',
    },
    brand: {
        showLogo: true,
        tagline:
            'Handcrafted furniture built to be lived in. Chairs, tables and sofas made to turn a house into somewhere you actually want to stay.',
    },
    // Not a list of links: this column is built from the product types the admin
    // has created, the same way the shop nav is, so a new kind appears here too.
    collections: {
        enabled: true,
        heading: 'Collections',
    },
    columns: [
        {
            heading: 'Company',
            links: [
                { label: 'About Us', href: '/about' },
                { label: 'Top Picks', href: '/top-picks' },
                { label: 'My Orders', href: '/orders' },
            ],
        },
    ],
    contact: {
        enabled: true,
        heading: 'Visit the Showroom',
        // The shop's street address. Multi-line: line breaks survive to the footer.
        address: 'Lahore, Punjab, Pakistan',
        // A maps link for the address above. Empty means show it as plain text.
        mapUrl: '',
        phone: '',
        email: '',
        hours: 'Mon – Sat, 10am – 8pm',
    },
    // Empty by default: a social icon with nowhere to go is worse than no icon.
    social: {
        enabled: true,
        items: [],
    },
    bottom: {
        // {year} becomes the current year when the footer renders.
        copyright: '© {year} Kursimeyz. All rights reserved.',
        links: [],
    },
};

// Caps exist so one long paste cannot break the layout for every visitor.
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

const normalizeFooterContent = (body) => {
    const source = asObject(body);
    const defaults = DEFAULT_FOOTER_CONTENT;

    const theme = asObject(source.theme);
    const brand = asObject(source.brand);
    const collections = asObject(source.collections);
    const contact = asObject(source.contact);
    const social = asObject(source.social);
    const bottom = asObject(source.bottom);

    const mapLink = (link) => ({
        label: pickString(link.label, '', LIMITS.linkLabel),
        href: pickHref(link.href, '', LIMITS.href),
    });

    // A link missing either half is dead weight in the rendered column.
    const isEmptyLink = (link) => link.label === '' || link.href === '';

    return {
        enabled: pickBoolean(source.enabled, defaults.enabled),
        theme: {
            backgroundColor: pickColor(
                theme.backgroundColor,
                defaults.theme.backgroundColor
            ),
            accentColor: pickColor(theme.accentColor, defaults.theme.accentColor),
            textColor: pickColor(theme.textColor, defaults.theme.textColor),
        },
        brand: {
            showLogo: pickBoolean(brand.showLogo, defaults.brand.showLogo),
            tagline: pickParagraph(brand.tagline, defaults.brand.tagline, LIMITS.tagline),
        },
        collections: {
            enabled: pickBoolean(collections.enabled, defaults.collections.enabled),
            heading: pickString(
                collections.heading,
                defaults.collections.heading,
                LIMITS.heading
            ),
        },
        columns: pickList({
            value: source.columns,
            fallback: defaults.columns,
            maxItems: LIMITS.columns,
            mapItem: (column) => {
                const value = asObject(column);
                return {
                    heading: pickString(value.heading, '', LIMITS.heading),
                    links: pickList({
                        value: value.links,
                        fallback: [],
                        maxItems: LIMITS.linksPerColumn,
                        mapItem: (link) => mapLink(asObject(link)),
                        isEmpty: isEmptyLink,
                    }),
                };
            },
            // A column with no heading and no links would render as a blank gap.
            isEmpty: (column) => column.heading === '' && column.links.length === 0,
        }),
        contact: {
            enabled: pickBoolean(contact.enabled, defaults.contact.enabled),
            heading: pickString(contact.heading, defaults.contact.heading, LIMITS.heading),
            address: pickParagraph(contact.address, defaults.contact.address, LIMITS.address),
            mapUrl: pickHref(contact.mapUrl, defaults.contact.mapUrl, LIMITS.href),
            phone: pickString(contact.phone, defaults.contact.phone, LIMITS.phone),
            email: pickString(contact.email, defaults.contact.email, LIMITS.email),
            hours: pickString(contact.hours, defaults.contact.hours, LIMITS.hours),
        },
        social: {
            enabled: pickBoolean(social.enabled, defaults.social.enabled),
            items: pickList({
                value: social.items,
                fallback: defaults.social.items,
                maxItems: LIMITS.social,
                mapItem: (item) => {
                    const value = asObject(item);
                    return {
                        platform: pickOneOf(
                            value.platform,
                            SOCIAL_PLATFORMS,
                            SOCIAL_PLATFORMS[0]
                        ),
                        href: pickHref(value.href, '', LIMITS.href),
                    };
                },
                isEmpty: (item) => item.href === '',
            }),
        },
        bottom: {
            copyright: pickString(
                bottom.copyright,
                defaults.bottom.copyright,
                LIMITS.copyright
            ),
            links: pickList({
                value: bottom.links,
                fallback: defaults.bottom.links,
                maxItems: LIMITS.bottomLinks,
                mapItem: (link) => mapLink(asObject(link)),
                isEmpty: isEmptyLink,
            }),
        },
    };
};

module.exports = {
    DEFAULT_FOOTER_CONTENT,
    SOCIAL_PLATFORMS,
    normalizeFooterContent,
};
