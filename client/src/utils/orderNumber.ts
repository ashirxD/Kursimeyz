/** Anything with an id that may carry an admin-set number. */
export interface OrderLabelSource {
    _id: string;
    orderNumber?: string;
}

/** Matches ALLOWED_CHARACTERS in server/utils/orderNumber.js. */
export const ORDER_NUMBER_PATTERN = /^[A-Za-z0-9 _\-/#.]+$/;

/** Matches MAX_LENGTH in server/utils/orderNumber.js. */
export const ORDER_NUMBER_MAX_LENGTH = 32;

/**
 * The label to print for an order.
 *
 * Orders are keyed in the database by an ObjectId that cannot change, so what
 * gets quoted is either the number an admin set or, failing that, the tail of
 * that id. The returned string is complete — it already carries the leading '#'
 * in the derived case — so callers print it as-is and never add their own.
 *
 * `fallbackLength` is how much of the id to show when no number is set. It
 * differs by surface (6 in the admin tables, 8 in emails and order history) so
 * orders nobody has renamed keep exactly the label they had before.
 *
 * Mirrors orderLabel in server/utils/orderNumber.js.
 */
export function orderLabel(order: OrderLabelSource, fallbackLength: number = 6): string {
    const custom = order.orderNumber?.trim();
    if (custom) return custom;

    return `#${order._id.slice(-fallbackLength).toUpperCase()}`;
}

/** Whether an admin-typed number is one the server will accept. */
export function isValidOrderNumber(value: string): boolean {
    const trimmed = value.trim();

    // Empty is valid — it clears the number and reverts to the derived label.
    if (trimmed === '') return true;

    return trimmed.length <= ORDER_NUMBER_MAX_LENGTH && ORDER_NUMBER_PATTERN.test(trimmed);
}
