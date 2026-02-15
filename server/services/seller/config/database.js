const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.SELLER_DB_URI || "mongodb://127.0.0.1:27017/novamart_sellers";
    await mongoose.connect(uri);
    console.log("Seller DB connected");
  } catch (err) {
    console.error("Seller DB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
