const { CATEGORIES } = require("../../../shared/config");

exports.getCategories = async (_req, res) => {
  res.json({ success: true, categories: CATEGORIES });
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = CATEGORIES.find((c) => c.slug === req.params.slug);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};
