import axios from 'axios';

/**
 * Turns whatever a failed request threw into something a person can read.
 *
 * The server answers every failure in one shape — `{ message, code, errors?,
 * requestId }` (see server/middleware/errorHandler.js) — and its `message` is
 * already written for people, so it is used as it is. This file covers what the
 * server cannot say for itself: the request never arrived, it took too long, or
 * something between us (a proxy, a host) answered with a page instead of JSON.
 *
 * Raw JavaScript errors ("Cannot read properties of undefined") are never shown;
 * they mean nothing to a shopper.
 */

export const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export const NETWORK_ERROR_MESSAGE =
    "We can't reach the server. Please check your internet connection and try again.";

export const TIMEOUT_ERROR_MESSAGE =
    'This is taking longer than expected. Please check your connection and try again.';

/** What to say when the server gave a status but no readable message. */
const STATUS_MESSAGES: Record<number, string> = {
    400: "That didn't look right. Please check the details and try again.",
    401: 'Please sign in to continue.',
    403: "You don't have permission to do that.",
    404: "We couldn't find what you were looking for.",
    408: TIMEOUT_ERROR_MESSAGE,
    409: 'That conflicts with something that already exists.',
    413: 'That is too large to send. Please try something smaller.',
    429: 'Too many attempts. Please wait a moment and try again.',
    500: 'Something went wrong on our side. Please try again in a moment.',
    502: 'The service is temporarily unavailable. Please try again in a moment.',
    503: 'The service is temporarily unavailable. Please try again in a moment.',
    504: 'The service is taking too long to respond. Please try again in a moment.',
};

interface ServerErrorBody {
    message?: unknown;
    code?: unknown;
    errors?: unknown;
    requestId?: unknown;
}

export interface ApiErrorInfo {
    /** Safe to show as-is. */
    message: string;
    /** Stable name for the problem, e.g. SESSION_EXPIRED. Absent for network failures. */
    code?: string;
    status?: number;
    /** Quote this to whoever looks into it; it finds the exact log line. */
    reference?: string;
    /** Per-field problems, e.g. { phone: 'Already in use' }. */
    fieldErrors?: Record<string, string>;
    kind: 'server' | 'network' | 'timeout' | 'unknown';
}

const asString = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);

const asFieldErrors = (value: unknown): Record<string, string> | undefined => {
    if (!value || typeof value !== 'object') return undefined;

    const entries = Object.entries(value as Record<string, unknown>).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
    );

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

/** The first eight characters are enough to find a request in the log and easy to read aloud. */
const shortReference = (id: string) => id.replace(/-/g, '').slice(0, 8);

export function parseApiError(error: unknown): ApiErrorInfo {
    if (axios.isAxiosError(error)) {
        const response = error.response;

        if (!response) {
            // No answer at all. A cancelled request is the caller's doing, not a failure.
            if (error.code === 'ERR_CANCELED') {
                return { message: '', kind: 'unknown' };
            }
            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                return { message: TIMEOUT_ERROR_MESSAGE, kind: 'timeout' };
            }
            return { message: NETWORK_ERROR_MESSAGE, kind: 'network' };
        }

        const body: ServerErrorBody | undefined =
            response.data && typeof response.data === 'object' ? (response.data as ServerErrorBody) : undefined;

        const code = asString(body?.code);
        const requestId = asString(body?.requestId) ?? asString(response.headers?.['x-request-id']);
        const serverMessage = asString(body?.message);

        // Our own generic "something went wrong" is the one message that benefits from
        // a reference, since the person has nothing else to tell support.
        const isGeneric = response.status >= 500 && code === 'INTERNAL_ERROR';

        return {
            message: serverMessage ?? STATUS_MESSAGES[response.status] ?? DEFAULT_ERROR_MESSAGE,
            code,
            status: response.status,
            reference: isGeneric && requestId ? shortReference(requestId) : undefined,
            fieldErrors: asFieldErrors(body?.errors),
            kind: 'server',
        };
    }

    if (error instanceof Error && error.message === 'Auth required') {
        return { message: 'Please sign in to continue.', code: 'AUTH_REQUIRED', kind: 'unknown' };
    }

    return { message: DEFAULT_ERROR_MESSAGE, kind: 'unknown' };
}

/**
 * The message to show for a failure.
 *
 * `fallback` says what was being attempted ("Failed to save phone number") and is
 * used only when we know nothing better; a dropped connection or a message the
 * server wrote for this exact problem is always more useful than it.
 */
export function getErrorMessage(error: unknown, fallback?: string): string {
    const info = parseApiError(error);

    if (info.kind === 'unknown' && fallback) return fallback;
    if (info.kind === 'server' && !info.code && !info.message && fallback) return fallback;

    return info.reference ? `${info.message} (Reference: ${info.reference})` : info.message;
}

/** Per-field messages from a validation failure, for showing beside the inputs. */
export function getFieldErrors(error: unknown): Record<string, string> {
    return parseApiError(error).fieldErrors ?? {};
}

/** Sessions that ended or never were valid — the one failure the app reacts to itself. */
export function isSessionError(error: unknown): boolean {
    const { code } = parseApiError(error);
    return code === 'SESSION_EXPIRED' || code === 'INVALID_TOKEN';
}

/** A 4xx other than a timeout: asking again unchanged will not help, so do not retry. */
export function isClientError(error: unknown): boolean {
    const { status } = parseApiError(error);
    return status !== undefined && status >= 400 && status < 500 && status !== 408 && status !== 429;
}

/** The one signal the add-to-cart flow uses to ask for a phone number. Not a failure to report. */
export function isPhoneRequired(error: unknown): boolean {
    return parseApiError(error).code === 'PHONE_REQUIRED';
}
