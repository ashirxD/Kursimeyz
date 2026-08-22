/**
 * A product's finish: what its body and its fabric are made of, and what colour
 * each one is.
 *
 * A colour is a *swatch*, not just a hex. When the admin circled a spot on a
 * photo of the real material, `image` holds that cropped circle and is shown
 * instead, so wood grain and weave survive; `hex` is then the average of the
 * circle, kept for anywhere an image will not do.
 *
 * Mirrors server/utils/productFinish.js.
 */

export interface Swatch {
    hex: string;
    /** Cropped circular photo of the real material. Shown instead of `hex`. */
    image: string;
}

export interface FinishPart {
    color: Swatch;
    material: string;
}

export interface ProductFinish {
    body: FinishPart;
    fabric: FinishPart;
}

export type FinishPartKey = keyof ProductFinish;

/** In display order, with the label each one carries in the UI. */
export const FINISH_PARTS: Array<{ key: FinishPartKey; label: string }> = [
    { key: 'body', label: 'Body' },
    { key: 'fabric', label: 'Fabric' },
];

/** Matches MATERIAL_MAX_LENGTH in server/utils/productFinish.js. */
export const MATERIAL_MAX_LENGTH = 60;

const HEX = /^#[0-9a-fA-F]{6}$/;

export const emptySwatch = (): Swatch => ({ hex: '', image: '' });

export const emptyFinishPart = (): FinishPart => ({ color: emptySwatch(), material: '' });

export const emptyFinish = (): ProductFinish => ({
    body: emptyFinishPart(),
    fabric: emptyFinishPart(),
});

export const isSwatchEmpty = (swatch: Swatch): boolean =>
    swatch.hex === '' && swatch.image === '';

export const isFinishPartEmpty = (part: FinishPart): boolean =>
    isSwatchEmpty(part.color) && part.material === '';

export const isFinishEmpty = (finish: ProductFinish): boolean =>
    FINISH_PARTS.every(({ key }) => isFinishPartEmpty(finish[key]));

const readSwatch = (value: unknown): Swatch => {
    const source = (value ?? {}) as Partial<Swatch>;
    const hex = typeof source.hex === 'string' && HEX.test(source.hex.trim())
        ? source.hex.trim().toLowerCase()
        : '';
    const image = typeof source.image === 'string' ? source.image.trim() : '';

    return { hex, image };
};

const readPart = (value: unknown): FinishPart => {
    const source = (value ?? {}) as Partial<FinishPart>;

    return {
        color: readSwatch(source.color),
        material: typeof source.material === 'string' ? source.material.trim() : '',
    };
};

/** Anything that might carry a finish, plus the legacy single colour. */
export interface FinishSource {
    finish?: Partial<ProductFinish> | null;
    /** Pre-finish products only had this. */
    color?: string | null;
}

/**
 * The finish to display, filling in what legacy rows lack.
 *
 * Products and orders saved before this feature only have `color`; it becomes the
 * fabric colour, which is where the shop's existing colours belong. Mirrors
 * resolveFinish in server/utils/productFinish.js.
 */
export function resolveFinish(source: FinishSource | null | undefined): ProductFinish {
    const raw = (source?.finish ?? {}) as Partial<ProductFinish>;

    const finish: ProductFinish = {
        body: readPart(raw.body),
        fabric: readPart(raw.fabric),
    };

    if (isSwatchEmpty(finish.fabric.color)) {
        const legacy = typeof source?.color === 'string' ? source.color.trim() : '';
        if (HEX.test(legacy)) {
            finish.fabric.color = { hex: legacy.toLowerCase(), image: '' };
        }
    }

    return finish;
}

/** The words to print for a part: its material, or failing that its hex. */
export function finishPartLabel(part: FinishPart): string {
    if (part.material) return part.material;
    return part.color.hex ? part.color.hex.toUpperCase() : '';
}
