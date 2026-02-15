const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/product.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/", ctrl.getProducts);
router.get("/featured", ctrl.getFeaturedProducts);
router.get("/seller/:shopId", ctrl.getSellerProducts);
router.get("/id/:id", ctrl.getProductById);
router.get("/:slug", ctrl.getProduct);
router.post("/", authenticate, ctrl.createProduct);
router.put("/:id", authenticate, ctrl.updateProduct);
router.put("/:id/toggle-active", authenticate, ctrl.toggleActive);
router.delete("/:id", authenticate, ctrl.deleteProduct);

module.exports = router;
