const mongoose = require("mongoose");

async function connectDB() {
  try {
    const uri = process.env.ORDER_DB_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/novamart_orders";
    await mongoose.connect(uri);
    console.log("✓ Order DB connected:", mongoose.connection.name);
  } catch (error) {
    console.error("✗ Order DB connection failed:", error);
    process.exit(1);
  }
}

module.exports = { connectDB };
