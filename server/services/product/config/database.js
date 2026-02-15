const mongoose = require("mongoose");

async function connectDB() {
  try {
    const uri = process.env.PRODUCT_DB_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/novamart_products";
    await mongoose.connect(uri);
    console.log("✓ Product DB connected:", mongoose.connection.name);
  } catch (error) {
    console.error("✗ Product DB connection failed:", error);
    process.exit(1);
  }
}

module.exports = { connectDB };
