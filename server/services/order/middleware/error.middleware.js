const { AppError } = require("../../../shared/utils");

module.exports = (err, _req, res, _next) => {
  let error = { ...err, message: err.message };

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = AppError.badRequest(messages.join(", "));
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(", ");
    error = AppError.badRequest(`Duplicate value for ${field}`);
  }

  if (err.name === "CastError") {
    error = AppError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};
