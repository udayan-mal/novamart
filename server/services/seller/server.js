require("dotenv").config({ path: "../../.env" });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");
const errorMiddleware = require("./middleware/error.middleware");

const sellerRoutes = require("./routes/seller.routes");

const app = express();
const PORT = process.env.SELLER_SERVICE_PORT || 6004;

app.use(helmet());
app.use(cors({ origin: [process.env.FRONTEND_URL, process.env.SELLER_DASHBOARD_URL, process.env.ADMIN_DASHBOARD_URL], credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ service: "seller-service", status: "ok" }));

app.use("/api/v1/sellers", sellerRoutes);

app.use(errorMiddleware);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Seller service running on port ${PORT}`));
});
