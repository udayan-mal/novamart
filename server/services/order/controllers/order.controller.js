const Order = require("../models/order.model");
const { AppError } = require("../../../shared/utils");
const { calculatePlatformFee } = require("../../../shared/utils");

/* ───── helpers ───── */
const STATUS_FLOW = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

function canTransition(from, to) {
  if (to === "cancelled") return ["pending", "confirmed"].includes(from);
  if (to === "returned") return from === "delivered";
  const fromIdx = STATUS_FLOW.indexOf(from);
  const toIdx = STATUS_FLOW.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  return toIdx === fromIdx + 1;
}

/* ───── Create order (COD or after Stripe success) ───── */
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      subtotal,
      shippingCost = 0,
      discount = 0,
      tax = 0,
      total,
      paymentMethod,
      couponCode,
      stripeSessionId,
      stripePaymentIntentId,
    } = req.body;

    if (!items || items.length === 0) throw AppError.badRequest("Order must have at least one item");
    if (!shippingAddress) throw AppError.badRequest("Shipping address is required");

    const enrichedItems = items.map((item) => {
      const fee = calculatePlatformFee(item.price * item.quantity);
      return {
        ...item,
        platformFee: fee,
        sellerEarnings: item.price * item.quantity - fee,
      };
    });

    const order = await Order.create({
      userId: req.user.id,
      items: enrichedItems,
      shippingAddress,
      subtotal,
      shippingCost,
      discount,
      tax,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      couponCode,
      stripeSessionId,
      stripePaymentIntentId,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/* ───── Get my orders ───── */
exports.getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort("-createdAt").skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

/* ───── Get single order ───── */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw AppError.notFound("Order not found");

    if (order.userId !== req.user.id && req.user.role !== "admin") {
      throw AppError.forbidden("Not authorized to view this order");
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/* ───── Get orders for a seller ───── */
exports.getSellerOrders = async (req, res, next) => {
  try {
    const shopId = req.query.shopId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { "items.shopId": shopId };
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort("-createdAt").skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

/* ───── Update order status (seller / admin) ───── */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) throw AppError.notFound("Order not found");

    if (!canTransition(order.status, status)) {
      throw AppError.badRequest(`Cannot transition from "${order.status}" to "${status}"`);
    }

    order.status = status;

    if (status === "delivered") {
      order.deliveredAt = new Date();
      if (order.paymentMethod === "cod") order.paymentStatus = "paid";
    }

    if (status === "cancelled") {
      order.cancelledAt = new Date();
      order.cancelReason = req.body.reason || "";
      if (order.paymentStatus === "paid") order.paymentStatus = "refunded";
    }

    if (status === "returned") {
      order.paymentStatus = "refunded";
    }

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/* ───── Cancel order (buyer — only pending/confirmed) ───── */
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw AppError.notFound("Order not found");
    if (order.userId !== req.user.id) throw AppError.forbidden("Not your order");

    if (!["pending", "confirmed"].includes(order.status)) {
      throw AppError.badRequest("Order cannot be cancelled at this stage");
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || "Cancelled by customer";
    if (order.paymentStatus === "paid") order.paymentStatus = "refunded";

    await order.save();
    res.json({ success: true, message: "Order cancelled", order });
  } catch (err) {
    next(err);
  }
};

/* ───── Admin: get all orders ───── */
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort("-createdAt").skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

/* ───── Admin: dashboard stats ───── */
exports.getOrderStats = async (_req, res, next) => {
  try {
    const [totalOrders, totalRevenue, statusCounts] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const statsByStatus = {};
    statusCounts.forEach((s) => (statsByStatus[s._id] = s.count));

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        byStatus: statsByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};
