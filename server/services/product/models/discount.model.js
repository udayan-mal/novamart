const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "flat"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    shopId: { type: String, required: true, index: true },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

discountSchema.index({ code: 1, shopId: 1 }, { unique: true });

module.exports = mongoose.model("Discount", discountSchema);
