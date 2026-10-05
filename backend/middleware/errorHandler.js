/**
 * Centralized error handler — always returns JSON, never exposes raw DB errors.
 */
export function errorHandler(err, req, res, _next) {
  console.error(`[${req.method} ${req.path}]`, err.message);

  // Duplicate entry (e.g., unique constraint violation)
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ success: false, message: "Duplicate entry — record already exists." });
  }

  // Foreign key constraint failure
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({ success: false, message: "Referenced record does not exist." });
  }

  // Custom application errors with a status code
  const status = err.status || 500;
  const message = status < 500 ? err.message : "An unexpected server error occurred.";
  return res.status(status).json({ success: false, message });
}

/**
 * Throws an HTTP error with a status code.
 * Usage: throw httpError(404, "Customer not found")
 */
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Wraps an async route handler — propagates errors to the centralized handler.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
