// The app's own errors.
//
// Throw one of these when something is the caller's doing and has a sensible
// answer — a missing field, a taken email, an order that is already paid. The
// message is written for the person who will read it, so it is sent as it is.
// Anything else that reaches the error handler (a bug, a dropped database
// connection) is treated as our fault and answered with a safe, friendly line
// instead; see middleware/errorHandler.js.

class AppError extends Error {
  /**
   * @param {string} message  What the user should read. Plain language, no jargon.
   * @param {object} [options]
   * @param {number} [options.statusCode=500]
   * @param {string} [options.code]     Stable machine-readable name, e.g. 'EMAIL_TAKEN'.
   * @param {object} [options.errors]   Per-field messages, e.g. { phone: 'Already in use' }.
   * @param {Error}  [options.cause]    The underlying error, kept for the log only.
   */
  constructor(message, { statusCode = 500, code, errors, cause } = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code || defaultCode(statusCode);
    this.errors = errors;
    this.cause = cause;
    this.isOperational = true;
    Error.captureStackTrace?.(this, AppError);
  }
}

function defaultCode(statusCode) {
  switch (statusCode) {
    case 400: return 'BAD_REQUEST';
    case 401: return 'AUTH_REQUIRED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 409: return 'CONFLICT';
    case 413: return 'PAYLOAD_TOO_LARGE';
    case 422: return 'UNPROCESSABLE';
    case 429: return 'RATE_LIMITED';
    case 502: return 'UPSTREAM_FAILED';
    case 503: return 'SERVICE_UNAVAILABLE';
    default: return statusCode >= 500 ? 'INTERNAL_ERROR' : 'ERROR';
  }
}

const make = (statusCode) => (message, options = {}) => new AppError(message, { statusCode, ...options });

module.exports = {
  AppError,
  badRequest: make(400),
  unauthorized: make(401),
  forbidden: make(403),
  notFound: make(404),
  conflict: make(409),
  unavailable: make(503),
};
