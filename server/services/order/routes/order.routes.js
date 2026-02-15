const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const ctrl = require("../controllers/order.controller");

router.post("/", authenticate, ctrl.createOrder);
router.get("/my-orders", authenticate, ctrl.getMyOrders);
router.get("/seller-orders", authenticate, authorize("seller", "admin"), ctrl.getSellerOrders);
router.get("/stats", authenticate, authorize("admin"), ctrl.getOrderStats);
router.get("/all", authenticate, authorize("admin"), ctrl.getAllOrders);
router.get("/:id", authenticate, ctrl.getOrder);
router.put("/:id/status", authenticate, authorize("seller", "admin"), ctrl.updateOrderStatus);
router.put("/:id/cancel", authenticate, ctrl.cancelOrder);

module.exports = router;
