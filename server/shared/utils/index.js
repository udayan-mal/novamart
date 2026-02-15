const { AppError, ErrorHandler } = require("./error-handler");
const { generateOtp, isOtpExpired } = require("./otp");
const { slugify, truncate, capitalize, formatCurrency } = require("./string");
const { generateOrderId, calculatePlatformFee } = require("./order");
const { validateEmail, validatePassword } = require("./validators");

module.exports = {
  AppError,
  ErrorHandler,
  generateOtp,
  isOtpExpired,
  slugify,
  truncate,
  capitalize,
  formatCurrency,
  generateOrderId,
  calculatePlatformFee,
  validateEmail,
  validatePassword,
};
