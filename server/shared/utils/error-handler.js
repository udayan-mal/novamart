class AppError extends Error {
  constructor(message, statusCode = 500, errors) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors) {
    return new AppError(message, 400, errors);
  }
  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }
  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }
  static notFound(message = "Resource not found") {
    return new AppError(message, 404);
  }
  static conflict(message) {
    return new AppError(message, 409);
  }
  static tooManyRequests(message = "Too many requests") {
    return new AppError(message, 429);
  }
  static internal(message = "Internal server error") {
    return new AppError(message, 500);
  }
}

class ErrorHandler {
  static handle(err) {
    if (err instanceof AppError) {
      return {
        success: false,
        message: err.message,
        statusCode: err.statusCode,
        errors: err.errors,
      };
    }
    console.error("Unhandled Error:", err);
    return { success: false, message: "An unexpected error occurred", statusCode: 500 };
  }
}

module.exports = { AppError, ErrorHandler };
