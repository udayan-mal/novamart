const { createProxyMiddleware } = require("http-proxy-middleware");

const serviceRoutes = [
  { path: "/api/v1/auth", target: `http://localhost:${process.env.AUTH_SERVICE_PORT || 6001}`, name: "Auth" },
  { path: "/api/v1/products", target: `http://localhost:${process.env.PRODUCT_SERVICE_PORT || 6002}`, name: "Product" },
  { path: "/api/v1/categories", target: `http://localhost:${process.env.PRODUCT_SERVICE_PORT || 6002}`, name: "Product" },
  { path: "/api/v1/reviews", target: `http://localhost:${process.env.PRODUCT_SERVICE_PORT || 6002}`, name: "Product" },
  { path: "/api/v1/discounts", target: `http://localhost:${process.env.PRODUCT_SERVICE_PORT || 6002}`, name: "Product" },
  { path: "/api/v1/orders", target: `http://localhost:${process.env.ORDER_SERVICE_PORT || 6003}`, name: "Order" },
  { path: "/api/v1/payments", target: `http://localhost:${process.env.ORDER_SERVICE_PORT || 6003}`, name: "Order" },
  { path: "/api/v1/sellers", target: `http://localhost:${process.env.SELLER_SERVICE_PORT || 6004}`, name: "Seller" },
  { path: "/api/v1/shops", target: `http://localhost:${process.env.SELLER_SERVICE_PORT || 6004}`, name: "Seller" },
];

function setupProxyRoutes(app) {
  serviceRoutes.forEach(({ path, target, name }) => {
    app.use(
      path,
      createProxyMiddleware({
        target,
        changeOrigin: true,
        on: {
          proxyReq: (_proxyReq, req) => {
            console.log(`[Gateway] → ${name}: ${req.method} ${req.originalUrl}`);
          },
          error: (err, _req, res) => {
            console.error(`[Gateway] ✗ ${name} error:`, err.message);
            if (res.writeHead) {
              res.writeHead(503, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, message: `${name} service is unavailable` }));
            }
          },
        },
      })
    );
  });
  console.log(`✓ Proxy routes configured for ${serviceRoutes.length} services`);
}

module.exports = { setupProxyRoutes };
