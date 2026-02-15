const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { connectDB } = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const { errorMiddleware } = require("./middleware/error.middleware");

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 6001;

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/auth/users", userRoutes);

app.get("/health", (_req, res) => {
  res.json({ success: true, service: "auth-service", status: "healthy" });
});

// ── Error Handler ─────────────────────────────────────────────
app.use(errorMiddleware);

// ── Start ─────────────────────────────────────────────────────
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🔐 Auth Service running on port ${PORT}`);
  });
}

start().catch(console.error);

module.exports = app;
