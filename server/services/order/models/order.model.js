const mongoose = require("mongoose");
const { generateOrderId } = require("../../../shared/utils");

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  shopId: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String, default: "" },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedColor: { type: String, default: "" },
  selectedSize: { type: String, default: "" },
  sellerEarnings: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    userId: { type: String, required: true, index: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["stripe", "cod"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    couponCode: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned", "refunded"],
      default: "pending",
    },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  if (!this.orderId) this.orderId = generateOrderId();
  next();
});

module.exports = mongoose.model("Order", orderSchema);
