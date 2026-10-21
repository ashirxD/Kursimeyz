const crypto = require('crypto');
const { AppError } = require('../utils/errors');
const { PHONE_IN_USE_MESSAGE } = require('../utils/phone');

// One place that decides what a failed request says.
//
// Every response an error produces has the same shape, so the client can rely on
// it:
//
//   { success: false, message, code, errors?, requestId }
//
// `message` is always safe to show a person. Internals — stack traces, driver
// messages, which collection failed — go to the server log, tagged with the same
// `requestId` the person is shown, so "reference 3f9a1c2e" finds the exact line.
// Outside production a `debug` block is added so developers can see the cause
// without opening the log.

const isProduction = () => process.env.NODE_ENV === 'production';

const GENERIC_MESSAGE =
  'Something went wrong on our side. Please try again in a moment. If it keeps happening, contact us and mention the reference code.';

// ---------------------------------------------------------------------------
// Request ids
// ---------------------------------------------------------------------------

/** Gives every request an id, echoes it in X-Request-Id, and makes it available as req.id. */
const requestId = (req, res, next) => {
  const incoming = req.headers['x-request-id'];
  // A caller-supplied id is only trusted if it is short and boring, since it ends up in logs.
  const id =
    typeof incoming === 'string' && /^[\w-]{6,64}$/.test(incoming) ? incoming : crypto.randomUUID();

  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};

// ---------------------------------------------------------------------------
// Wording
// ---------------------------------------------------------------------------

// Field names as a person would say them.
const FIELD_LABELS = {
  email: 'email address',
  phone: 'phone number',
  username: 'name',
  password: 'password',
  orderNumber: 'order number',
  discountPrice: 'discounted price',
  price: 'price',
  zipCode: 'postal code',
  street: 'street address',
  city: 'city',
  slug: 'name',
  subCategorySlug: 'category',
  pluralSlug: 'name',
  name: 'name',
  pluralName: 'plural name',
  description: 'description',
  image: 'photo',
  images: 'photos',
  quantity: 'quantity',
  paymentMethod: 'payment method',
};

const humanize = (path = '') => {
  const last = String(path).split('.').pop() || '';
  if (FIELD_LABELS[last]) return FIELD_LABELS[last];

  // "someFieldName" -> "some field name"
  return last.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').toLowerCase() || 'value';
};

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// A Mongoose ValidationError entry as one sentence.
const describeValidationFailure = (failure) => {
  const label = humanize(failure.path);

  switch (failure.kind) {
    case 'required':
      return `${capitalise(label)} is required.`;
    case 'minlength':
      return `${capitalise(label)} is too short.`;
    case 'maxlength':
      return `${capitalise(label)} is too long.`;
    case 'min':
      return `${capitalise(label)} is too low.`;
    case 'max':
      return `${capitalise(label)} is too high.`;
    case 'enum':
      return `Please choose a valid ${label}.`;
    case 'Number':
    case 'Boolean':
    case 'Date':
    case 'ObjectId':
      return `${capitalise(label)} isn't in the right format.`;
    case 'user defined':
      // Validators in our own schemas carry a message written for people.
      return failure.message || `${capitalise(label)} isn't valid.`;
    default:
      return failure.message && !/^Path `/.test(failure.message)
        ? failure.message
        : `${capitalise(label)} isn't valid.`;
  }
};

const DUPLICATE_MESSAGES = {
  email: 'An account with that email address already exists.',
  phone: PHONE_IN_USE_MESSAGE,
  orderNumber: 'That order number is already used by another order.',
};

// ---------------------------------------------------------------------------
// Translating an error
// ---------------------------------------------------------------------------

/**
 * Turns anything that was thrown into `{ status, body }`.
 *
 * @param {unknown} error
 * @param {object}  [options]
 * @param {string}  [options.fallbackMessage] What to say when we have no better idea;
 *                  controllers pass something specific, like "We couldn't load your cart."
 */
const toApiError = (error, { fallbackMessage } = {}) => {
  const err = error instanceof Error ? error : new Error(String(error));
  const name = err.name || '';
  const message = err.message || '';

  const result = (status, code, text, extra = {}) => ({ status, code, message: text, ...extra });

  // 1. Our own errors speak for themselves.
  if (err instanceof AppError) {
    return result(err.statusCode, err.code, err.message, { errors: err.errors });
  }

  // 2. Requests the body parser could not read.
  if (err.type === 'entity.parse.failed') {
    return result(400, 'INVALID_REQUEST', "We couldn't read that request. Please refresh the page and try again.");
  }
  if (err.type === 'entity.too.large') {
    return result(413, 'PAYLOAD_TOO_LARGE', 'That is too much to send at once. Please try again with less.');
  }

  // 3. File uploads.
  if (name === 'MulterError') {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return result(413, 'FILE_TOO_LARGE', 'That file is too large. Images can be up to 5MB.');
      case 'LIMIT_FILE_COUNT':
        return result(400, 'TOO_MANY_FILES', 'You selected too many files at once. Please pick fewer.');
      case 'LIMIT_UNEXPECTED_FILE':
        return result(400, 'UNEXPECTED_FILE', "That file couldn't be uploaded. Please try again.");
      default:
        return result(400, 'UPLOAD_FAILED', "That upload didn't work. Please try again.");
    }
  }

  // 4. Data that failed a schema rule.
  if (name === 'ValidationError' && err.errors && typeof err.errors === 'object') {
    const fields = Object.fromEntries(
      Object.values(err.errors).map((failure) => [failure.path, describeValidationFailure(failure)])
    );
    const sentences = Object.values(fields);

    return result(
      400,
      'VALIDATION_ERROR',
      sentences.length === 1 ? sentences[0] : `Please fix the following: ${sentences.join(' ')}`,
      { errors: fields }
    );
  }

  // 5. An id or value that is not the kind of thing the database expected.
  if (name === 'CastError') {
    if (err.kind === 'ObjectId' || err.path === '_id') {
      return result(404, 'NOT_FOUND', "We couldn't find what you were looking for. It may have been removed.");
    }
    return result(400, 'INVALID_VALUE', `${capitalise(humanize(err.path))} isn't in the right format.`);
  }

  // 6. Something that must be unique already exists.
  if (err.code === 11000 || err.code === 11001) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    const text = DUPLICATE_MESSAGES[field] || `That ${humanize(field)} is already in use. Please choose another.`;

    return result(409, 'DUPLICATE_VALUE', text, { errors: field ? { [field]: text } : undefined });
  }

  // 7. Sessions.
  if (name === 'TokenExpiredError') {
    return result(401, 'SESSION_EXPIRED', 'Your session has expired. Please sign in again.');
  }
  if (name === 'JsonWebTokenError' || name === 'NotBeforeError') {
    return result(401, 'INVALID_TOKEN', "We couldn't verify your sign-in. Please sign in again.");
  }

  // 8. The database is not reachable.
  if (
    /^Mongo(Network|ServerSelection|NotConnected)/.test(name) ||
    /^Mongoose(ServerSelection)/.test(name) ||
    /buffering timed out/i.test(message)
  ) {
    return result(503, 'DATABASE_UNAVAILABLE', "We're having trouble reaching our database. Please try again in a moment.");
  }

  // 9. Mail could not be sent.
  if (['EAUTH', 'ECONNECTION', 'ESOCKET', 'EENVELOPE', 'EDNS'].includes(err.code) && err.command !== undefined) {
    return result(502, 'EMAIL_SEND_FAILED', "We couldn't send the email right now. Please try again in a moment.");
  }

  // 10. Other errors that carry a client-error status and wrote their own message
  //     (the phone and shipping validators do this). Anything the framework or a
  //     library produced for a 5xx is NOT trusted to be fit to show.
  const status = err.statusCode || err.status;
  if (Number.isInteger(status) && status >= 400 && status < 500 && message) {
    return result(status, err.code && typeof err.code === 'string' ? err.code : 'BAD_REQUEST', message);
  }

  // 11. Our fault.
  return result(500, 'INTERNAL_ERROR', fallbackMessage || GENERIC_MESSAGE);
};

// ---------------------------------------------------------------------------
// Sending it
// ---------------------------------------------------------------------------

const logError = (req, apiError, error) => {
  const entry = {
    requestId: req?.id,
    method: req?.method,
    url: req?.originalUrl,
    status: apiError.status,
    code: apiError.code,
    user: req?.user?._id?.toString?.() || req?.user?.id,
    error: error?.message,
  };

  if (apiError.status >= 500) {
    console.error(`[ERROR] ${apiError.status} ${apiError.code}`, entry, '\n', error?.stack || error);
    if (error?.cause) console.error('[ERROR] caused by:', error.cause?.message || error.cause);
  } else if (apiError.status >= 400 && apiError.code === 'VALIDATION_ERROR') {
    console.warn(`[WARN] ${apiError.status} ${apiError.code}`, entry);
  }
};

/**
 * Answers a request with a failure, in the standard shape.
 *
 * Controllers call this from their `catch` blocks:
 *
 *   } catch (error) {
 *     return sendError(res, error, "We couldn't load your cart.");
 *   }
 *
 * Known problems (a taken email, a bad id, an expired session…) are described
 * properly whatever the fallback says; the fallback is only for what we did not
 * expect.
 */
const sendError = (res, error, fallbackMessage) => {
  const req = res.req;
  const apiError = toApiError(error, { fallbackMessage });

  logError(req, apiError, error);

  if (res.headersSent) return undefined;

  const body = {
    success: false,
    message: apiError.message,
    code: apiError.code,
    ...(apiError.errors && { errors: apiError.errors }),
    ...(req?.id && { requestId: req.id }),
  };

  if (!isProduction() && apiError.status >= 500) {
    body.debug = {
      name: error?.name,
      message: error?.message,
      // The underlying failure behind an AppError, e.g. what S3 actually said.
      cause: error?.cause?.message,
      stack: error?.stack,
    };
  }

  return res.status(apiError.status).json(body);
};

/** For routes nothing matched. */
const notFoundHandler = (req, res) =>
  sendError(
    res,
    new AppError(`We couldn't find that. (${req.method} ${req.originalUrl})`, {
      statusCode: 404,
      code: 'ROUTE_NOT_FOUND',
    })
  );

/** The last stop: anything thrown or passed to next(err) that no route handled itself. */
// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  return sendError(res, error);
};

module.exports = {
  GENERIC_MESSAGE,
  requestId,
  toApiError,
  sendError,
  notFoundHandler,
  errorHandler,
};
