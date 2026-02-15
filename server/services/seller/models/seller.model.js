const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Shop name is required"], trim: true },
    slug: { type: String, unique: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, default: "" },
    description: { type: String, default: "", maxlength: 2000 },
    avatar: { type: String, default: "" },
    banner: { type: String, default: "" },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    status: { type: String, enum: ["pending", "approved", "rejected", "suspended"], default: "pending" },
    rejectionReason: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    followers: [{ type: String }],
    followerCount: { type: Number, default: 0 },
    stripeAccountId: { type: String, default: "" },
    stripeOnboarded: { type: Boolean, default: false },
    socialLinks: {
      website: { type: String, default: "" },
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
    categories: [{ type: String }],
    policies: {
      returnPolicy: { type: String, default: "" },
      shippingPolicy: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

sellerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

sellerSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

sellerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Seller", sellerSchema);
