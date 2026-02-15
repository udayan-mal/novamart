const cron = require("node-cron");
const Product = require("../models/product.model");

function startCronJobs() {
  // Permanently delete soft-deleted products older than 30 days (runs daily at 2 AM)
  cron.schedule("0 2 * * *", async () => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await Product.deleteMany({
        isDeleted: true,
        deletedAt: { $lte: thirtyDaysAgo },
      }).setOptions({ includeDeleted: true });
      if (result.deletedCount > 0) {
        console.log(`🗑  Cleaned up ${result.deletedCount} deleted products`);
      }
    } catch (error) {
      console.error("Cron cleanup error:", error);
    }
  });

  console.log("✓ Cron jobs started");
}

module.exports = { startCronJobs };
