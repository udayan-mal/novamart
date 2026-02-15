const mongoose = require("mongoose");

async function connectDB() {
  try {
    const uri = process.env.AUTH_DB_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/novamart_auth";
    await mongoose.connect(uri);
    console.log("✓ Auth DB connected:", mongoose.connection.name);
  } catch (error) {
    console.error("✗ Auth DB connection failed:", error);
    process.exit(1);
  }
}

module.exports = { connectDB };
