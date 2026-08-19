// Shared sanitisers for the admin-authored page content — the About page and the
// dashboard hero, and whatever comes next.
//
// Each `pick*` takes the submitted value and a fallback, and always returns
// something usable: the cleaned value when it is acceptable, the fallback when it
// is not. Callers therefore never have to check, and a malformed request degrades
// to the shipped default rather than storing junk or throwing.
//
// The one exception is that empty strings are usually *kept*, since clearing a
// field is a deliberate act ("hide this heading") rather than a mistake.

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
// Material Symbols ligature names — lowercase, digits and underscores only.
const ICON_NAME = /^[a-z0-9_]{1,40}$/;
// Absolute http(s) only, matching what the client's resolveImageUrl will display.
const IMAGE_URL = /^https?:\/\//i;
// Everything a button legitimately needs, and nothing that executes.
// Scheme-anchored, so javascript: and data: URLs never reach a rendered href.
const SAFE_HREF = /^(?:https?:\/\/|mailto:|tel:|\/)/i;

const asObject = (value) => (value && typeof value === 'object' ? value : {});

/**
 * A single-line string. Whitespace is collapsed rather than rejected, so a stray
 * newline pasted into a heading is harmless instead of breaking the line.
 */
const pickString = (value, fallback, maxLength) => {
    if (typeof value !== 'string') return fallback;
    return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
};

/** Multi-line text. Line breaks survive; only runs of blank lines are collapsed. */
const pickParagraph = (value, fallback, maxLength) => {
    if (typeof value !== 'string') return fallback;
    return value.trim().replace(/\n{3,}/g, '\n\n').slice(0, maxLength);
};

const pickBoolean = (value, fallback) => (typeof value === 'boolean' ? value : fallback);

/** A #rrggbb colour. `allowEmpty` permits '' to mean "no colour set". */
const pickColor = (value, fallback, { allowEmpty = false } = {}) => {
    if (typeof value !== 'string') return fallback;

    const trimmed = value.trim();
    if (trimmed === '' && allowEmpty) return '';
    if (HEX_COLOR.test(trimmed)) return trimmed.toLowerCase();

    return fallback;
};

const pickIcon = (value, fallback) => {
    if (typeof value !== 'string') return fallback;

    const trimmed = value.trim().toLowerCase();
    return ICON_NAME.test(trimmed) ? trimmed : fallback;
};

/** An absolute image URL, or '' for "no image". */
const pickImage = (value, fallback, maxLength) => {
    if (typeof value !== 'string') return fallback;

    const trimmed = value.trim().slice(0, maxLength);
    if (trimmed === '') return '';

    return IMAGE_URL.test(trimmed) ? trimmed : fallback;
};

/** A link destination, or '' for "no destination". Unsafe schemes are rejected. */
const pickHref = (value, fallback, maxLength) => {
    if (typeof value !== 'string') return fallback;

    const trimmed = value.trim().slice(0, maxLength);
    if (trimmed === '') return '';

    return SAFE_HREF.test(trimmed) ? trimmed : fallback;
};

/**
 * Maps a submitted list through mapItem, drops the entries isEmpty rejects and
 * caps the length. A non-array falls back to the defaults, so a malformed request
 * cannot silently empty a whole section.
 */
const pickList = ({ value, fallback, maxItems, mapItem, isEmpty }) => {
    if (!Array.isArray(value)) return fallback;

    return value
        .slice(0, maxItems)
        .map((item) => mapItem(item ?? {}))
        .filter((item) => !isEmpty(item));
};

/** Constrains a value to a fixed set, e.g. 'left' | 'right'. */
const pickOneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

module.exports = {
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
};
