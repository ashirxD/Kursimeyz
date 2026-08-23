/**
 * A product description is one plain string, the way it has always been stored,
 * but the admin writes it as a stack of separate details. A blank line is the
 * seam between them — the same plain-text-with-newlines convention the About and
 * Home page copy already uses.
 *
 * Splitting on a blank line rather than every newline means a single Enter stays
 * inside the detail the admin was writing, so a two-line address or a wrapped
 * sentence survives a save-and-reopen as one block instead of quietly becoming
 * two.
 */
const BLOCK_SEPARATOR = '\n\n';
const BLOCK_BOUNDARY = /\r?\n\s*\r?\n/;

/** The separate details in a stored description, in order. Never returns blanks. */
export function splitDescriptionBlocks(description?: string | null): string[] {
    if (!description) return [];

    return description
        .split(BLOCK_BOUNDARY)
        .map((block) => block.trim())
        .filter((block) => block !== '');
}

/**
 * Back into the single string the API and the Product model expect. Empty
 * blocks are dropped, so a detail the admin added and left blank never becomes
 * a phantom gap on the product page.
 */
export function joinDescriptionBlocks(blocks: string[]): string {
    return blocks
        .map((block) => block.trim())
        .filter((block) => block !== '')
        .join(BLOCK_SEPARATOR);
}
