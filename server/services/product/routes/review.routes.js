const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/review.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/:productId", ctrl.getProductReviews);
router.post("/", authenticate, ctrl.createReview);
router.delete("/:id", authenticate, ctrl.deleteReview);

module.exports = router;
