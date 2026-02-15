const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/order.model");
const { AppError } = require("../../../shared/utils");

/* ───── Create Stripe Checkout Session ───── */
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { items, shippingAddress, couponCode, discount = 0, tax = 0, shippingCost = 0 } = req.body;

    if (!items || items.length === 0) throw AppError.badRequest("Cart is empty");

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : [],
          metadata: { productId: item.productId, shopId: item.shopId },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    /* add shipping & tax as separate line items if > 0 */
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping" },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Tax" },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      customer_email: req.user.email,
      metadata: {
        userId: req.user.id,
        shippingAddress: JSON.stringify(shippingAddress),
        items: JSON.stringify(items.map((i) => ({ productId: i.productId, shopId: i.shopId, title: i.title, price: i.price, quantity: i.quantity, selectedColor: i.selectedColor, selectedSize: i.selectedSize, image: i.image }))),
        couponCode: couponCode || "",
        discount: String(discount),
        tax: String(tax),
        shippingCost: String(shippingCost),
      },
      success_url: `${process.env.FRONTEND_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    next(err);
  }
};

/* ───── Stripe Webhook ───── */
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook sig verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata;

    try {
      const items = JSON.parse(meta.items);
      const shippingAddress = JSON.parse(meta.shippingAddress);
      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const discount = parseFloat(meta.discount) || 0;
      const tax = parseFloat(meta.tax) || 0;
      const shippingCost = parseFloat(meta.shippingCost) || 0;
      const total = subtotal + shippingCost + tax - discount;

      const { calculatePlatformFee } = require("../../../shared/utils");

      const enrichedItems = items.map((item) => {
        const fee = calculatePlatformFee(item.price * item.quantity);
        return { ...item, platformFee: fee, sellerEarnings: item.price * item.quantity - fee };
      });

      await Order.create({
        userId: meta.userId,
        items: enrichedItems,
        shippingAddress,
        subtotal,
        shippingCost,
        discount,
        tax,
        total,
        paymentMethod: "stripe",
        paymentStatus: "paid",
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        couponCode: meta.couponCode,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      console.log("Order created via Stripe webhook for user", meta.userId);
    } catch (err) {
      console.error("Error creating order from webhook:", err);
    }
  }

  res.json({ received: true });
};

/* ───── Verify session (after redirect) ───── */
exports.verifySession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw AppError.badRequest("Payment not completed");
    }

    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) throw AppError.notFound("Order not found for this session");

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/* ───── Get payment history ───── */
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user.id, paymentMethod: "stripe" };
    const [payments, total] = await Promise.all([
      Order.find(filter)
        .select("orderId total paymentStatus paymentMethod stripeSessionId createdAt")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, payments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};
