// Express 4 does not look at the promise an async route handler returns, so a
// rejection that escapes a handler's try/catch is "unhandled" — and on current
// Node versions an unhandled rejection stops the whole server, for everyone.
//
// This makes every route and middleware promise-aware: a rejection is passed to
// next(err) like a thrown error, and lands in middleware/errorHandler.js. Load it
// once, before any route is registered.

const Layer = require('express/lib/router/layer');

const handleRequest = Layer.prototype.handle_request;

Layer.prototype.handle_request = function patchedHandleRequest(req, res, next) {
  const handler = this.handle;

  // Error-handling middleware (four arguments) is not a request handler.
  if (handler.length > 3) return handleRequest.call(this, req, res, next);

  try {
    const returned = handler(req, res, next);
    if (returned && typeof returned.catch === 'function') returned.catch(next);
  } catch (error) {
    next(error);
  }

  return undefined;
};
