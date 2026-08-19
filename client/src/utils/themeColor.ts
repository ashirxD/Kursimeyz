/**
 * Colour maths for admin-themed pages — the About page and the dashboard hero.
 *
 * Their colours are chosen at runtime, so they cannot be Tailwind classes —
 * Tailwind only generates what it can see at build time. Everything themeable is
 * an inline style instead, and the muted variants the design leans on (a heading
 * colour at 40%, 50%, 60%...) are mixed here rather than with opacity utilities.
 */

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

const toRgb = (color: string): [number, number, number] | null => {
    const trimmed = color.trim();
    if (!HEX.test(trimmed)) return null;

    const raw = trimmed.slice(1);
    const full =
        raw.length === 3
            ? raw
                  .split('')
                  .map((channel) => channel + channel)
                  .join('')
            : raw;

    return [
        parseInt(full.slice(0, 2), 16),
        parseInt(full.slice(2, 4), 16),
        parseInt(full.slice(4, 6), 16),
    ];
};

/**
 * A themed colour at partial opacity, e.g. withAlpha('#1a2f1a', 0.5).
 *
 * An unparseable colour is handed back untouched on purpose: the browser drops
 * the invalid declaration and the element inherits, which keeps text readable
 * while an admin is still halfway through typing a hex code in the editor.
 */
export function withAlpha(color: string, alpha: number): string {
    const rgb = toRgb(color);
    if (!rgb) return color;

    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/**
 * Blends `weight` of `toward` into `color`, e.g. mix('#f4f5f0', '#1a2f1a', 0.06).
 *
 * Used for the hover shades the design has, which were hand-picked constants
 * when the palette was fixed and have to be derived now that it is not.
 */
export function mix(color: string, toward: string, weight: number): string {
    const base = toRgb(color);
    const target = toRgb(toward);
    if (!base || !target) return color;

    const ratio = Math.min(Math.max(weight, 0), 1);
    const channel = (from: number, to: number) => Math.round(from + (to - from) * ratio);

    return `rgb(${channel(base[0], target[0])}, ${channel(base[1], target[1])}, ${channel(
        base[2],
        target[2],
    )})`;
}

// WCAG relative luminance.
const luminance = (color: string): number | null => {
    const rgb = toRgb(color);
    if (!rgb) return null;

    const [r, g, b] = rgb.map((channel) => {
        const ratio = channel / 255;
        return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: number, b: number) =>
    (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/**
 * Whichever of `dark` / `light` reads better on `background`.
 *
 * The contact panel and the accent buttons let the admin pick any background,
 * so their text colour is derived rather than configured — one fewer knob, and
 * no way to end up with white text on a cream panel.
 */
export function readableTextColor(
    background: string,
    dark: string,
    light: string = '#ffffff',
): string {
    const backgroundLuminance = luminance(background);
    if (backgroundLuminance === null) return dark;

    const darkLuminance = luminance(dark) ?? 0;
    const lightLuminance = luminance(light) ?? 1;

    return contrast(backgroundLuminance, darkLuminance) >=
        contrast(backgroundLuminance, lightLuminance)
        ? dark
        : light;
}
