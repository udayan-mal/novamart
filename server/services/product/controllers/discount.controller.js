const Discount = require("../models/discount.model");
const { AppError } = require("../../../shared/utils");

exports.createDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.create(req.body);
    res.status(201).json({ success: true, message: "Discount created", discount });
  } catch (error) {
    next(error);
  }
};

exports.getShopDiscounts = async (req, res, next) => {
  try {
    const discounts = await Discount.find({ shopId: req.params.shopId }).sort({ createdAt: -1 });
    res.json({ success: true, discounts });
  } catch (error) {
    next(error);
  }
};

exports.verifyDiscount = async (req, res, next) => {
  try {
    const { code, shopId, cartItems, cartTotal } = req.body;
    if (!code || !shopId) throw AppError.badRequest("Coupon code and shop ID required");

    const discount = await Discount.findOne({ code: code.toUpperCase(), shopId, isActive: true });
    if (!discount) throw AppError.notFound("Invalid coupon code");

    const now = new Date();
    if (now < discount.startDate || now > discount.endDate) throw AppError.badRequest("Coupon has expired");
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) throw AppError.badRequest("Coupon usage limit reached");
    if (discount.minOrderAmount && cartTotal < discount.minOrderAmount)
      throw AppError.badRequest(`Minimum order amount is $${discount.minOrderAmount}`);

    let discountAmount = 0;
    if (discount.type === "percentage") {
      discountAmount = (cartTotal * discount.value) / 100;
      if (discount.maxDiscount) discountAmount = Math.min(discountAmount, discount.maxDiscount);
    } else {
      discountAmount = discount.value;
    }
    discountAmount = Math.min(discountAmount, cartTotal);

    res.json({
      success: true,
      message: "Coupon applied",
      discount: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount: Math.round(discountAmount * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.findOneAndDelete({ _id: req.params.id, shopId: req.body.shopId });
    if (!discount) throw AppError.notFound("Discount not found");
    res.json({ success: true, message: "Discount deleted" });
  } catch (error) {
    next(error);
  }
};
