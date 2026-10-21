const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/errors');

// Signed-in routes. Failures are passed to the error handler as AppErrors so the
// person is told what to do — "sign in" and "your session expired" are different
// instructions, and the client acts on the `code` to tell them apart.
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(
      new AppError('Please sign in to continue.', { statusCode: 401, code: 'AUTH_REQUIRED' })
    );
  }

  let decoded;
  try {
    // Verify token
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (err) {
    // An expired token is the ordinary case (sessions end); anything else means
    // the token is not one we issued. Both mean "sign in again".
    return next(
      err.name === 'TokenExpiredError'
        ? new AppError('Your session has expired. Please sign in again.', {
            statusCode: 401,
            code: 'SESSION_EXPIRED',
            cause: err,
          })
        : new AppError("We couldn't verify your sign-in. Please sign in again.", {
            statusCode: 401,
            code: 'INVALID_TOKEN',
            cause: err,
          })
    );
  }

  try {
    req.user = await User.findById(decoded.id);
  } catch (err) {
    // A database problem, not the person's: let the handler say so.
    return next(err);
  }

  if (!req.user) {
    return next(
      new AppError("We couldn't find your account. Please sign in again.", {
        statusCode: 401,
        code: 'SESSION_EXPIRED',
      })
    );
  }

  next();
};

// Admin middleware - checks if user has admin role
exports.admin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  next(
    new AppError('This area is for admins only. Your account does not have access to it.', {
      statusCode: 403,
      code: 'FORBIDDEN',
    })
  );
};
