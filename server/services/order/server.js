const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { connectDB } = require("./config/database");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const { errorMiddleware } = require("./middleware/error.middleware");

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.ORDER_SERVICE_PORT || 6003;

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);

app.get("/health", (_req, res) => {
  res.json({ success: true, service: "order-service", status: "healthy" });
});

app.use(errorMiddleware);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🛒 Order Service running on port ${PORT}`);
  });
}

start().catch(console.error);
module.exports = app;
