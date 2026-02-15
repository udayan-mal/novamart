const crypto = require("crypto");

const PLATFORM_FEE_PERCENT = 10;

function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `NM-${timestamp}-${random}`;
}

function calculatePlatformFee(amount, feePercent = PLATFORM_FEE_PERCENT) {
  const platformFee = Math.round(amount * (feePercent / 100) * 100) / 100;
  const sellerEarnings = Math.round((amount - platformFee) * 100) / 100;
  return { sellerEarnings, platformFee };
}

module.exports = { generateOrderId, calculatePlatformFee };
