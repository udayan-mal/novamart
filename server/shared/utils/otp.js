const crypto = require("crypto");

function generateOtp(length = 6) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
}

function isOtpExpired(expiryDate) {
  return new Date() > new Date(expiryDate);
}

module.exports = { generateOtp, isOtpExpired };
