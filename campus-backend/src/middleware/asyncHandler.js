/**
 * Wraps async route handlers to automatically catch errors and pass them to the global error handler
 * This eliminates the need for try/catch blocks in every controller function.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
