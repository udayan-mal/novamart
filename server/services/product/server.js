const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { connectDB } = require("./config/database");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const reviewRoutes = require("./routes/review.routes");
const discountRoutes = require("./routes/discount.routes");
const { errorMiddleware } = require("./middleware/error.middleware");
const { startCronJobs } = require("./cron/cleanup");

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.PRODUCT_SERVICE_PORT || 6002;

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/discounts", discountRoutes);

app.get("/health", (_req, res) => {
  res.json({ success: true, service: "product-service", status: "healthy" });
});

app.use(errorMiddleware);

async function start() {
  await connectDB();
  startCronJobs();
  app.listen(PORT, () => {
    console.log(`📦 Product Service running on port ${PORT}`);
  });
}

start().catch(console.error);

module.exports = app;
