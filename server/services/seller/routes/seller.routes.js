const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const ctrl = require("../controllers/seller.controller");

/* ── Auth ── */
router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.post("/logout", ctrl.logout);
router.post("/refresh-token", ctrl.refreshToken);

/* ── Seller own ── */
router.get("/me", authenticate, ctrl.getProfile);
router.put("/me", authenticate, ctrl.updateProfile);
router.get("/stats", authenticate, ctrl.getStats);

/* ── Stripe Connect ── */
router.post("/stripe/connect", authenticate, ctrl.createStripeAccount);
router.get("/stripe/status", authenticate, ctrl.getStripeStatus);

/* ── Public ── */
router.get("/shop/:slug", ctrl.getShop);
router.put("/:id/follow", authenticate, ctrl.toggleFollow);

/* ── Admin ── */
router.get("/admin/all", authenticate, authorize("admin"), ctrl.getAllSellers);
router.put("/admin/:id/approve", authenticate, authorize("admin"), ctrl.approveSeller);
router.put("/admin/:id/reject", authenticate, authorize("admin"), ctrl.rejectSeller);
router.put("/admin/:id/suspend", authenticate, authorize("admin"), ctrl.suspendSeller);

module.exports = router;
