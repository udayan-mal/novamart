const mongoose = require("mongoose");
const { slugify } = require("../../../shared/utils");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    richDescription: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    costPrice: { type: Number, default: null },
    sku: { type: String, default: "" },
    stock: { type: Number, required: true, min: 0 },
    images: [
      {
        url: { type: String, required: true },
        fileId: { type: String },
        alt: { type: String, default: "" },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    category: { type: String, required: true },
    subcategory: { type: String, default: "" },
    brand: { type: String, default: "" },
    colors: [{ type: String }],
    sizes: [{ type: String }],
    tags: [{ type: String }],
    specifications: [{ key: String, value: String }],
    shopId: { type: String, required: true, index: true },
    shopName: { type: String, default: "" },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    isFeatured: { type: Boolean, default: false },
    eventStartDate: { type: Date, default: null },
    eventEndDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-generate slug
productSchema.pre("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title) + "-" + Date.now().toString(36);
  }
  next();
});

// Don't return deleted products by default
productSchema.pre(/^find/, function () {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

module.exports = mongoose.model("Product", productSchema);
