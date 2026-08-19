// An order's identity in the database is its ObjectId, which cannot be changed —
// payment confirmations, review prompts and the /admin/orders/:id links all point
// at it. What people actually quote is a short label: by default the tail of that
// id, and once an admin edits it, whatever they typed.
//
// This module owns both halves: validating an admin-typed number, and deciding
// which of the two to display. Mirrors client/src/utils/orderNumber.ts.

// Letters, digits, spaces and the separators invoice numbers normally use.
const ALLOWED_CHARACTERS = /^[A-Za-z0-9 _\-/#.]+$/;

const MAX_LENGTH = 32;

/**
 * Cleans an admin-typed order number.
 *
 * Returns the cleaned string, '' when the admin cleared the field (which reverts
 * the order to its derived label), or null when the value cannot be used — the
 * caller turns that into a 400 rather than silently storing something else.
 */
const normalizeOrderNumber = (value) => {
    if (typeof value !== 'string') return null;

    const trimmed = value.trim().replace(/\s+/g, ' ');

    if (trimmed === '') return '';
    if (trimmed.length > MAX_LENGTH) return null;
    if (!ALLOWED_CHARACTERS.test(trimmed)) return null;

    return trimmed;
};

/**
 * The label to print for an order.
 *
 * `fallbackLength` is how much of the id to show when the admin has not set a
 * number. It differs by surface — 6 in the admin tables, 8 in emails and the
 * customer's order history — so existing orders keep the label they already had.
 */
const orderLabel = (order, fallbackLength = 6) => {
    const custom = typeof order?.orderNumber === 'string' ? order.orderNumber.trim() : '';
    if (custom) return custom;

    const id = order?._id ? order._id.toString() : '';
    return `#${id.slice(-fallbackLength).toUpperCase()}`;
};

// A number like "ORD/1.2" has to be matched literally, not as a pattern — an
// unescaped "." would collide with "ORD/1X2" and report a clash that isn't one.
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Case-insensitive exact-match filter, for the uniqueness check. */
const orderNumberFilter = (orderNumber) => ({
    orderNumber: { $regex: `^${escapeRegExp(orderNumber)}$`, $options: 'i' },
});

module.exports = {
    MAX_LENGTH,
    normalizeOrderNumber,
    orderLabel,
    orderNumberFilter,
};
