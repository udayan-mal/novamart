const jwt = require("jsonwebtoken");
const Seller = require("../models/seller.model");
const { AppError } = require("../../../shared/utils");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/* ───── helpers ───── */
function signTokens(seller) {
  const payload = { id: seller._id, email: seller.email, role: "seller" };
  const access = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
  const refresh = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { access, refresh };
}

function setTokenCookies(res, tokens) {
  res.cookie("access_token", tokens.access, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 15 * 60 * 1000 });
  res.cookie("refresh_token", tokens.refresh, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
}

/* ───── Register Seller ───── */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, description, address, categories } = req.body;
    const exists = await Seller.findOne({ email });
    if (exists) throw AppError.badRequest("Email already registered as a seller");

    const seller = await Seller.create({ name, email, password, phone, description, address, categories });
    const tokens = signTokens(seller);
    setTokenCookies(res, tokens);

    const sellerObj = seller.toObject();
    delete sellerObj.password;

    res.status(201).json({ success: true, message: "Seller registration submitted for approval", seller: sellerObj });
  } catch (err) {
    next(err);
  }
};

/* ───── Login ───── */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw AppError.badRequest("Email and password are required");

    const seller = await Seller.findOne({ email }).select("+password");
    if (!seller) throw AppError.unauthorized("Invalid credentials");

    const match = await seller.comparePassword(password);
    if (!match) throw AppError.unauthorized("Invalid credentials");

    if (seller.status === "suspended") throw AppError.forbidden("Your seller account has been suspended");
    if (seller.status === "rejected") throw AppError.forbidden("Your seller application was rejected: " + seller.rejectionReason);

    const tokens = signTokens(seller);
    setTokenCookies(res, tokens);

    const sellerObj = seller.toObject();
    delete sellerObj.password;

    res.json({ success: true, seller: sellerObj });
  } catch (err) {
    next(err);
  }
};

/* ───── Logout ───── */
exports.logout = (_req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.json({ success: true, message: "Logged out" });
};

/* ───── Refresh Token ───── */
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) throw AppError.unauthorized("No refresh token");

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const seller = await Seller.findById(decoded.id);
    if (!seller) throw AppError.unauthorized("Seller not found");

    const tokens = signTokens(seller);
    setTokenCookies(res, tokens);

    res.json({ success: true, message: "Token refreshed" });
  } catch (err) {
    next(AppError.unauthorized("Invalid refresh token"));
  }
};

/* ───── Get own profile ───── */
exports.getProfile = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.user.id);
    if (!seller) throw AppError.notFound("Seller not found");
    res.json({ success: true, seller });
  } catch (err) {
    next(err);
  }
};

/* ───── Update profile ───── */
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "description", "avatar", "banner", "address", "socialLinks", "policies", "categories"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const seller = await Seller.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    if (!seller) throw AppError.notFound("Seller not found");
    res.json({ success: true, seller });
  } catch (err) {
    next(err);
  }
};

/* ───── Get public shop page ───── */
exports.getShop = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ slug: req.params.slug, status: "approved" }).select("-password");
    if (!seller) throw AppError.notFound("Shop not found");
    res.json({ success: true, seller });
  } catch (err) {
    next(err);
  }
};

/* ───── Follow / Unfollow ───── */
exports.toggleFollow = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) throw AppError.notFound("Seller not found");

    const userId = req.user.id;
    const idx = seller.followers.indexOf(userId);
    if (idx > -1) {
      seller.followers.splice(idx, 1);
      seller.followerCount = Math.max(0, seller.followerCount - 1);
    } else {
      seller.followers.push(userId);
      seller.followerCount += 1;
    }
    await seller.save();

    res.json({ success: true, following: idx === -1, followerCount: seller.followerCount });
  } catch (err) {
    next(err);
  }
};

/* ───── Stripe Connect Onboarding ───── */
exports.createStripeAccount = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.user.id);
    if (!seller) throw AppError.notFound("Seller not found");

    if (seller.stripeAccountId) {
      const link = await stripe.accountLinks.create({
        account: seller.stripeAccountId,
        refresh_url: `${process.env.SELLER_DASHBOARD_URL}/settings/payments`,
        return_url: `${process.env.SELLER_DASHBOARD_URL}/settings/payments?success=true`,
        type: "account_onboarding",
      });
      return res.json({ success: true, url: link.url });
    }

    const account = await stripe.accounts.create({ type: "express", email: seller.email, capabilities: { card_payments: { requested: true }, transfers: { requested: true } } });

    seller.stripeAccountId = account.id;
    await seller.save();

    const link = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.SELLER_DASHBOARD_URL}/settings/payments`,
      return_url: `${process.env.SELLER_DASHBOARD_URL}/settings/payments?success=true`,
      type: "account_onboarding",
    });

    res.json({ success: true, url: link.url });
  } catch (err) {
    next(err);
  }
};

/* ───── Check Stripe status ───── */
exports.getStripeStatus = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.user.id);
    if (!seller || !seller.stripeAccountId) {
      return res.json({ success: true, onboarded: false });
    }

    const account = await stripe.accounts.retrieve(seller.stripeAccountId);
    const onboarded = account.charges_enabled && account.payouts_enabled;

    if (onboarded && !seller.stripeOnboarded) {
      seller.stripeOnboarded = true;
      await seller.save();
    }

    res.json({ success: true, onboarded, accountId: seller.stripeAccountId });
  } catch (err) {
    next(err);
  }
};

/* ───── Admin: list sellers ───── */
exports.getAllSellers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };

    const [sellers, total] = await Promise.all([
      Seller.find(filter).sort("-createdAt").skip(skip).limit(limit),
      Seller.countDocuments(filter),
    ]);

    res.json({ success: true, sellers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

/* ───── Admin: approve seller ───── */
exports.approveSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findByIdAndUpdate(req.params.id, { status: "approved", rejectionReason: "" }, { new: true });
    if (!seller) throw AppError.notFound("Seller not found");
    res.json({ success: true, message: "Seller approved", seller });
  } catch (err) {
    next(err);
  }
};

/* ───── Admin: reject seller ───── */
exports.rejectSeller = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const seller = await Seller.findByIdAndUpdate(req.params.id, { status: "rejected", rejectionReason: reason || "Not approved" }, { new: true });
    if (!seller) throw AppError.notFound("Seller not found");
    res.json({ success: true, message: "Seller rejected", seller });
  } catch (err) {
    next(err);
  }
};

/* ───── Admin: suspend seller ───── */
exports.suspendSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findByIdAndUpdate(req.params.id, { status: "suspended" }, { new: true });
    if (!seller) throw AppError.notFound("Seller not found");
    res.json({ success: true, message: "Seller suspended", seller });
  } catch (err) {
    next(err);
  }
};

/* ───── Seller stats (own dashboard) ───── */
exports.getStats = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.user.id).select("totalProducts totalSales totalEarnings followerCount rating totalReviews");
    if (!seller) throw AppError.notFound("Seller not found");
    res.json({ success: true, stats: seller });
  } catch (err) {
    next(err);
  }
};
