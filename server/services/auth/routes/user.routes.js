const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.get("/profile", authenticate, userCtrl.getProfile);
router.put("/profile", authenticate, userCtrl.updateProfile);
router.post("/addresses", authenticate, userCtrl.addShippingAddress);
router.put("/addresses/:addressId", authenticate, userCtrl.updateShippingAddress);
router.delete("/addresses/:addressId", authenticate, userCtrl.deleteShippingAddress);

// Admin routes
router.get("/", authenticate, authorize("admin"), userCtrl.getAllUsers);
router.put("/:userId/ban", authenticate, authorize("admin"), userCtrl.toggleBan);
router.put("/:userId/promote", authenticate, authorize("admin"), userCtrl.promoteToAdmin);

module.exports = router;
