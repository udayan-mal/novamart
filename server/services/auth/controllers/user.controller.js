const User = require("../models/user.model");
const { AppError } = require("../../../shared/utils");

// ── GET USER PROFILE ──────────────────────────────────────────
exports.getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── UPDATE PROFILE ────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, phone, avatar } },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: "Profile updated", user });
  } catch (error) {
    next(error);
  }
};

// ── ADD SHIPPING ADDRESS ──────────────────────────────────────
exports.addShippingAddress = async (req, res, next) => {
  try {
    const { fullName, phone, street, city, state, zipCode, country, isDefault } = req.body;
    if (!fullName || !phone || !street || !city || !state || !zipCode || !country)
      throw AppError.badRequest("All address fields are required");

    const user = await User.findById(req.user._id);

    // If this new address is default → unset other defaults
    if (isDefault) {
      user.shippingAddresses.forEach((addr) => (addr.isDefault = false));
    }
    // If it's the first address, make it default
    if (user.shippingAddresses.length === 0) {
      req.body.isDefault = true;
    }

    user.shippingAddresses.push({ fullName, phone, street, city, state, zipCode, country, isDefault: isDefault || user.shippingAddresses.length === 0 });
    await user.save();

    res.status(201).json({ success: true, message: "Address added", addresses: user.shippingAddresses });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE SHIPPING ADDRESS ───────────────────────────────────
exports.updateShippingAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    const address = user.shippingAddresses.id(addressId);
    if (!address) throw AppError.notFound("Address not found");

    Object.assign(address, req.body);
    if (req.body.isDefault) {
      user.shippingAddresses.forEach((a) => {
        a.isDefault = a._id.toString() === addressId;
      });
    }
    await user.save();

    res.json({ success: true, message: "Address updated", addresses: user.shippingAddresses });
  } catch (error) {
    next(error);
  }
};

// ── DELETE SHIPPING ADDRESS ───────────────────────────────────
exports.deleteShippingAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    user.shippingAddresses = user.shippingAddresses.filter(
      (a) => a._id.toString() !== addressId
    );
    await user.save();
    res.json({ success: true, message: "Address deleted", addresses: user.shippingAddresses });
  } catch (error) {
    next(error);
  }
};

// ── GET ALL USERS (Admin) ─────────────────────────────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (role) filter.role = role;

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// ── BAN / UNBAN USER (Admin) ──────────────────────────────────
exports.toggleBan = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) throw AppError.notFound("User not found");

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      success: true,
      message: user.isBanned ? "User banned" : "User unbanned",
    });
  } catch (error) {
    next(error);
  }
};

// ── PROMOTE TO ADMIN ──────────────────────────────────────────
exports.promoteToAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) throw AppError.notFound("User not found");

    user.role = "admin";
    await user.save();

    res.json({ success: true, message: "User promoted to admin" });
  } catch (error) {
    next(error);
  }
};
