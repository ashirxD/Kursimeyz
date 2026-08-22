// A product's finish: what its body and its fabric are made of, and what colour
// each one is.
//
// A colour here is a *swatch*, not just a hex code. The admin can pick a flat
// colour, or circle a spot on a photo of the real material — in which case the
// cropped circle is stored as an image and shown instead, so wood grain and
// weave survive. `hex` is always filled in (for a cropped swatch it is the
// average of the circle), so anywhere too small or too plain for an image still
// has something to draw.
//
// Legacy products predate all of this and only have the single `color` string.
// resolveFinish() folds that in as the fabric colour, so nothing needs migrating.

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const IMAGE_URL = /^https?:\/\//i;

const MATERIAL_MAX_LENGTH = 60;
const IMAGE_MAX_LENGTH = 500;

/** The two parts of a product that carry their own colour and material. */
const FINISH_PARTS = ['body', 'fabric'];

const asObject = (value) => (value && typeof value === 'object' ? value : {});

const pickHex = (value) => {
    if (typeof value !== 'string') return '';

    const trimmed = value.trim();
    return HEX_COLOR.test(trimmed) ? trimmed.toLowerCase() : '';
};

const pickSwatchImage = (value) => {
    if (typeof value !== 'string') return '';

    const trimmed = value.trim().slice(0, IMAGE_MAX_LENGTH);
    return IMAGE_URL.test(trimmed) ? trimmed : '';
};

/** Free text, but collapsed and capped so it stays a label rather than an essay. */
const pickMaterial = (value) => {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/\s+/g, ' ').slice(0, MATERIAL_MAX_LENGTH);
};

const normalizeSwatch = (value) => {
    const source = asObject(value);
    const image = pickSwatchImage(source.image);
    const hex = pickHex(source.hex);

    // An image swatch with no usable average is still worth keeping — the UI can
    // show the picture — but a swatch with neither is simply "not set".
    return { hex, image };
};

const isSwatchEmpty = (swatch) => swatch.hex === '' && swatch.image === '';

const normalizePart = (value) => {
    const source = asObject(value);

    return {
        color: normalizeSwatch(source.color),
        material: pickMaterial(source.material),
    };
};

/**
 * Builds the stored finish from whatever the product form sent.
 *
 * Unset parts are kept as empty rather than dropped, so the shape is always
 * complete and callers never have to guard.
 */
const normalizeFinish = (value) => {
    const source = asObject(value);

    return {
        body: normalizePart(source.body),
        fabric: normalizePart(source.fabric),
    };
};

/**
 * The finish to display for a product, filling in what legacy rows lack.
 *
 * Products saved before this feature only have `color`; it becomes the fabric
 * colour, which is where the shop's existing colours belong. Mirrors
 * resolveFinish in client/src/utils/productFinish.ts.
 */
const resolveFinish = (product) => {
    const finish = normalizeFinish(product?.finish);

    if (isSwatchEmpty(finish.fabric.color)) {
        const legacy = pickHex(product?.color);
        if (legacy) finish.fabric.color = { hex: legacy, image: '' };
    }

    return finish;
};

/**
 * The value for Product.color, which is kept as a mirror so older readers — the
 * cart, the checkout summary — keep working. Same idea as image ↔ images[0].
 */
const mirrorLegacyColor = (finish, fallback) => {
    const fabric = finish?.fabric?.color;
    const body = finish?.body?.color;

    return fabric?.hex || body?.hex || pickHex(fallback);
};

/** True when there is nothing to show for either part. */
const isFinishEmpty = (finish) =>
    FINISH_PARTS.every(
        (part) => isSwatchEmpty(finish[part].color) && finish[part].material === ''
    );

module.exports = {
    FINISH_PARTS,
    MATERIAL_MAX_LENGTH,
    isFinishEmpty,
    isSwatchEmpty,
    mirrorLegacyColor,
    normalizeFinish,
    pickMaterial,
    resolveFinish,
};
