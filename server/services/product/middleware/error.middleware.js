const { AppError } = require("../../../shared/utils");

function errorMiddleware(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, errors: err.errors });
  }
  if (err.name === "ValidationError") {
    const errors = {};
    Object.keys(err.errors).forEach((k) => (errors[k] = err.errors[k].message));
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }
  console.error("Product Service Error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
}

module.exports = { errorMiddleware };
