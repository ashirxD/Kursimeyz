/**
 * How a product photo is framed on a shop card.
 *
 * The upload is never edited: these numbers are saved beside it and applied when
 * it is drawn. The shop card, the admin card and the crop editor all draw through
 * the same renderer from the same numbers, so what the admin sees while adjusting
 * is what shoppers get. Mirrors server/utils/productImageDisplay.js.
 */

/** Card shapes an admin can give a collection, written width:height. */
export type CardAspect = '4:3' | '1:1' | '4:5' | '3:4' | '3:2' | '16:9';

export const DEFAULT_CARD_ASPECT: CardAspect = '4:3';

export const CARD_ASPECT_OPTIONS: Array<{ value: CardAspect; label: string; hint: string }> = [
    { value: '4:3', label: '4:3', hint: 'Landscape' },
    { value: '3:2', label: '3:2', hint: 'Wide' },
    { value: '16:9', label: '16:9', hint: 'Panorama' },
    { value: '1:1', label: '1:1', hint: 'Square' },
    { value: '4:5', label: '4:5', hint: 'Portrait' },
    { value: '3:4', label: '3:4', hint: 'Tall' },
];

/** Whole photo (`contain`), or fill the frame and crop the overflow (`cover`). */
export type ImageFit = 'cover' | 'contain';

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
export const MAX_PADDING = 20;

/** The shop card's background, which a photo sits on unless the admin picks another. */
export const DEFAULT_BACKGROUND = '#faf9f6';

/** Background swatches offered in the editor. */
export const BACKGROUND_SWATCHES = [
    DEFAULT_BACKGROUND,
    '#ffffff',
    '#f4f5f0',
    '#f2ece0',
    '#e4e1da',
    '#1a2f1a',
];

export interface ImageDisplay {
    /** The photo this belongs to. Keyed by URL so reordering never misplaces a crop. */
    url: string;
    fit: ImageFit;
    /** 1 shows the photo at its framed size; higher zooms in on it. */
    zoom: number;
    /** Which part of the photo is in view, 0–100. 50/50 is centred. */
    x: number;
    y: number;
    /** Breathing room around a contained photo, as a percentage of the card width. */
    padding: number;
    /** Hex behind the photo. Empty means DEFAULT_BACKGROUND. */
    background: string;
}

/** What a photo looks like until the admin touches it — the shop's original treatment. */
export const DEFAULT_DISPLAY: Omit<ImageDisplay, 'url'> = {
    fit: 'contain',
    zoom: 1,
    x: 50,
    y: 50,
    padding: 7,
    background: '',
};

export const resolveCardAspect = (aspect?: string | null): CardAspect =>
    CARD_ASPECT_OPTIONS.some((option) => option.value === aspect)
        ? (aspect as CardAspect)
        : DEFAULT_CARD_ASPECT;

/** `"4:3"` → width ÷ height. */
export const aspectRatio = (aspect?: string | null): number => {
    const [width, height] = resolveCardAspect(aspect).split(':').map(Number);
    return width / height;
};

/** `"4:3"` → `"4 / 3"`, the form CSS `aspect-ratio` takes. */
export const aspectCss = (aspect?: string | null): string =>
    resolveCardAspect(aspect).replace(':', ' / ');

/** The saved framing for `url`, or the defaults when the admin never adjusted it. */
export const getImageDisplay = (
    list: ImageDisplay[] | null | undefined,
    url: string,
): ImageDisplay => {
    const saved = list?.find((entry) => entry.url === url);
    return saved ? { ...DEFAULT_DISPLAY, ...saved } : { ...DEFAULT_DISPLAY, url };
};

/** Adds or replaces the entry for `next.url`. */
export const withImageDisplay = (list: ImageDisplay[], next: ImageDisplay): ImageDisplay[] => [
    ...list.filter((entry) => entry.url !== next.url),
    next,
];

/** Drops framing for photos that are no longer in the gallery. */
export const pruneImageDisplay = (list: ImageDisplay[], urls: string[]): ImageDisplay[] =>
    list.filter((entry) => urls.includes(entry.url));

export const isDefaultDisplay = (display: ImageDisplay): boolean =>
    display.fit === DEFAULT_DISPLAY.fit &&
    display.zoom === DEFAULT_DISPLAY.zoom &&
    display.x === DEFAULT_DISPLAY.x &&
    display.y === DEFAULT_DISPLAY.y &&
    display.padding === DEFAULT_DISPLAY.padding &&
    !display.background;

/**
 * Where the photo's edges land inside the frame, in pixels.
 *
 * The renderer pins the photo so that its left edge sits at `x% × range` — range
 * being how much room is left over (negative when the photo is bigger than the
 * frame). That linearity is what lets a drag of N pixels become a change of
 * N ÷ range in x, which is how the editor pans.
 */
export const panRange = (
    frame: { width: number; height: number },
    natural: { width: number; height: number },
    display: Pick<ImageDisplay, 'fit' | 'zoom' | 'padding'>,
): { x: number; y: number } => {
    const inset = display.fit === 'contain' ? (display.padding / 100) * frame.width : 0;
    const width = frame.width - inset * 2;
    const height = frame.height - inset * 2;

    const scale =
        display.fit === 'cover'
            ? Math.max(width / natural.width, height / natural.height)
            : Math.min(width / natural.width, height / natural.height);

    return {
        x: width - natural.width * scale * display.zoom,
        y: height - natural.height * scale * display.zoom,
    };
};
