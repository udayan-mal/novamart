const Product = require("../models/product.model");
const { AppError } = require("../../../shared/utils");

// ── CREATE PRODUCT ────────────────────────────────────────────
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({ ...req.body, shopId: req.body.shopId || req.user.userId });
    res.status(201).json({ success: true, message: "Product created", product });
  } catch (error) {
    next(error);
  }
};

// ── GET ALL PRODUCTS (Public, filtered) ───────────────────────
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, category, subcategory, minPrice, maxPrice,
      colors, sizes, brand, rating, sortBy, search, shopId, isFeatured, isEvent,
    } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (brand) filter.brand = brand;
    if (shopId) filter.shopId = shopId;
    if (isFeatured === "true") filter.isFeatured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (colors) filter.colors = { $in: colors.split(",") };
    if (sizes) filter.sizes = { $in: sizes.split(",") };
    if (rating) filter.rating = { $gte: Number(rating) };
    if (search) filter.title = { $regex: search, $options: "i" };
    if (isEvent === "true") {
      filter.eventStartDate = { $lte: new Date() };
      filter.eventEndDate = { $gte: new Date() };
    }

    let sort = { createdAt: -1 };
    if (sortBy === "price_asc") sort = { price: 1 };
    if (sortBy === "price_desc") sort = { price: -1 };
    if (sortBy === "popular") sort = { salesCount: -1 };
    if (sortBy === "rating") sort = { rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      hasMore: skip + products.length < total,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET SINGLE PRODUCT ────────────────────────────────────────
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) throw AppError.notFound("Product not found");
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// ── GET PRODUCT BY ID ─────────────────────────────────────────
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw AppError.notFound("Product not found");
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// ── GET SELLER PRODUCTS ───────────────────────────────────────
exports.getSellerProducts = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ shopId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments({ shopId }),
    ]);

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE PRODUCT ────────────────────────────────────────────
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shopId: req.body.shopId || req.user.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) throw AppError.notFound("Product not found or unauthorized");
    res.json({ success: true, message: "Product updated", product });
  } catch (error) {
    next(error);
  }
};

// ── SOFT DELETE PRODUCT ───────────────────────────────────────
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!product) throw AppError.notFound("Product not found");
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

// ── TOGGLE PRODUCT ACTIVE STATUS ──────────────────────────────
exports.toggleActive = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw AppError.notFound("Product not found");
    product.isActive = !product.isActive;
    await product.save();
    res.json({ success: true, message: product.isActive ? "Product activated" : "Product deactivated" });
  } catch (error) {
    next(error);
  }
};

// ── FEATURED PRODUCTS ─────────────────────────────────────────
exports.getFeaturedProducts = async (_req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true }).limit(12);
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};
