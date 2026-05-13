function notFound(req, res, _next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }
  // Mongoose validation
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  const status = err.status || 500;
  const payload = { error: err.message || "Internal server error" };
  if (process.env.NODE_ENV !== "production") payload.stack = err.stack;
  console.error(err);
  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };