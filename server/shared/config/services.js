const SERVICES = {
  AUTH: { name: "auth-service", port: 6001 },
  PRODUCT: { name: "product-service", port: 6002 },
  ORDER: { name: "order-service", port: 6003 },
  SELLER: { name: "seller-service", port: 6004 },
  CHAT: { name: "chat-service", port: 6005 },
  NOTIFICATION: { name: "notification-service", port: 6006 },
};

const SERVICE_ROUTES = [
  { path: "/api/v1/auth", target: "AUTH" },
  { path: "/api/v1/products", target: "PRODUCT" },
  { path: "/api/v1/categories", target: "PRODUCT" },
  { path: "/api/v1/reviews", target: "PRODUCT" },
  { path: "/api/v1/discounts", target: "PRODUCT" },
  { path: "/api/v1/orders", target: "ORDER" },
  { path: "/api/v1/payments", target: "ORDER" },
  { path: "/api/v1/sellers", target: "SELLER" },
  { path: "/api/v1/shops", target: "SELLER" },
  { path: "/api/v1/chat", target: "CHAT" },
  { path: "/api/v1/notifications", target: "NOTIFICATION" },
];

module.exports = { SERVICES, SERVICE_ROUTES };
