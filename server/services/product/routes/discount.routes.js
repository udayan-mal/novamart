const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/discount.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/shop/:shopId", ctrl.getShopDiscounts);
router.post("/", authenticate, ctrl.createDiscount);
router.post("/verify", ctrl.verifyDiscount);
router.delete("/:id", authenticate, ctrl.deleteDiscount);

module.exports = router;
