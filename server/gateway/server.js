// ═══════════════════════════════════════════════════════════════
//  NovaMart API Gateway
//  Routes requests to the appropriate microservice
// ═══════════════════════════════════════════════════════════════

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const { setupProxyRoutes } = require("./proxy");
const { errorMiddleware } = require("./middleware/error");

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 5000;

// ── Security & Parsing ────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.WEB_URL || "http://localhost:3000",
      process.env.SELLER_DASHBOARD_URL || "http://localhost:3001",
      process.env.ADMIN_DASHBOARD_URL || "http://localhost:3002",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ─────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ── Health Check ──────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "NovaMart API Gateway is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ── Proxy Routes ──────────────────────────────────────────────
setupProxyRoutes(app);

// ── Error Handler ─────────────────────────────────────────────
app.use(errorMiddleware);

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 NovaMart API Gateway running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}\n`);
});

module.exports = app;
