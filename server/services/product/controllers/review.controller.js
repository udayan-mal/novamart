const Review = require("../models/review.model");
const Product = require("../models/product.model");
const { AppError } = require("../../../shared/utils");

exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment, images } = req.body;
    if (!productId || !rating || !comment) throw AppError.badRequest("Product ID, rating and comment are required");

    const product = await Product.findById(productId);
    if (!product) throw AppError.notFound("Product not found");

    const review = await Review.create({
      userId: req.user.userId,
      userName: req.body.userName || "User",
      userAvatar: req.body.userAvatar || "",
      productId,
      shopId: product.shopId,
      rating,
      title,
      comment,
      images: images || [],
    });

    // Update product rating
    const reviews = await Review.find({ productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    product.rating = Math.round(avgRating * 10) / 10;
    product.reviewCount = reviews.length;
    await product.save();

    res.status(201).json({ success: true, message: "Review added", review });
  } catch (error) {
    next(error);
  }
};

exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ productId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Review.countDocuments({ productId }),
    ]);

    res.json({ success: true, reviews, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!review) throw AppError.notFound("Review not found or unauthorized");

    // Recalculate product rating
    const reviews = await Review.find({ productId: review.productId });
    const product = await Product.findById(review.productId);
    if (product) {
      product.rating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
      product.reviewCount = reviews.length;
      await product.save();
    }

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    next(error);
  }
};
