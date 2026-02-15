const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const ctrl = require("../controllers/payment.controller");

router.post("/create-checkout-session", authenticate, ctrl.createCheckoutSession);
router.post("/webhook", express.raw({ type: "application/json" }), ctrl.stripeWebhook);
router.get("/verify/:sessionId", authenticate, ctrl.verifySession);
router.get("/history", authenticate, ctrl.getPaymentHistory);

module.exports = router;
