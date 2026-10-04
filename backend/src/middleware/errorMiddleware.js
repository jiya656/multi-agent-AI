// errorMiddleware.js
// Uses `error` as the top-level key (NOT `message`) — every existing
// frontend thunk already reads err.response.data.error. Adopting the
// plan's { success, message } shape here would silently break every
// error message shown in the app.

const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: "A record with that value already exists" });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: err.message || "Internal server error" });
};

module.exports = errorMiddleware;