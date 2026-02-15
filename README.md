<div align="center">

  <img src="client/public/logo.svg" alt="NovaMart Logo" width="80" />

  # NovaMart

  ### Modern Multi-Vendor E-Commerce SaaS Platform

  A **production-ready**, full-stack marketplace where multiple sellers manage their own shops, customers browse and purchase products, and admins oversee the entire platform — built with **React 19**, **Node.js**, **Express**, **MongoDB**, and **Stripe**.

  ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
  ![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)
  ![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
  ![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## 📸 Overview

NovaMart is a **multi-vendor marketplace** similar to Amazon, Etsy, or Shopify — where:

- **Customers** browse products, add to cart, checkout with Stripe or Cash-on-Delivery, track orders, and leave reviews.
- **Sellers** register their shop, manage products & inventory, handle orders, create discount codes, and view analytics.
- **Admins** manage users, approve/reject sellers, monitor all orders, and configure platform settings.

The application features **dark/light mode**, responsive design, and a modern UI built with Tailwind CSS.

---

## 🏗️ Architecture

```
NovaMart/
├── client/                 → React 19 + Vite (Unified Frontend)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── storefront/    (Customer-facing pages)
│   │   │   ├── seller/        (Seller dashboard pages)
│   │   │   └── admin/         (Admin dashboard pages)
│   │   ├── components/        (Shared UI components)
│   │   ├── store/             (Zustand state management)
│   │   └── lib/               (API client, utilities)
│   └── public/                (Logo, favicon)
│
├── server/                 → Node.js + Express (Microservices Backend)
│   ├── gateway/               (API Gateway — port 5000)
│   ├── services/
│   │   ├── auth/              (Authentication — port 6001)
│   │   ├── product/           (Products, Reviews, Discounts — port 6002)
│   │   ├── order/             (Orders, Stripe Payments — port 6003)
│   │   └── seller/            (Seller Management — port 6004)
│   └── shared/                (Shared utilities & config)
│
├── package.json            → Root scripts (dev, build, install)
├── .env.example            → Environment variables template
└── README.md
```

### Why This Architecture?

| Decision | Reason |
|----------|--------|
| **client/ + server/** | Clean separation — easy to navigate for any developer |
| **Microservices** | Each service owns its database, scales independently |
| **API Gateway** | Single entry point; handles routing, rate limiting, CORS |
| **Unified React App** | One app with role-based routing — simpler deployment |
| **Zustand** | Lightweight state management (no Redux boilerplate) |

---

## ✨ Key Features

### 🛍️ Customer Storefront
- Product browsing with filters (category, price, color, size, brand, rating)
- Full-text search across products
- Product detail pages with image gallery
- Shopping cart (persisted in localStorage)
- Wishlist functionality
- Stripe checkout + Cash-on-Delivery
- Order tracking with status timeline
- Product reviews & ratings
- User profile with saved shipping addresses
- OTP email verification

### 🏪 Seller Dashboard
- Shop registration with admin approval workflow
- Product CRUD with image upload (ImageKit)
- Inventory management
- Order management with status flow: `pending → confirmed → packed → shipped → out_for_delivery → delivered`
- Discount code creation (percentage / flat amount)
- Revenue analytics with charts (Recharts)
- Payout tracking

### 🛡️ Admin Panel
- Dashboard with KPI cards and charts
- User management (view, ban/unban)
- Seller management (approve/reject applications)
- Product oversight (view, delete)
- Order monitoring with filters
- Platform settings (theme, fees)

### 🎨 Design & UX
- **Dark / Light mode** with system preference detection
- Responsive design (mobile → desktop)
- Gradient branding with Indigo → Emerald theme
- Custom logo with Playfair Display brand font
- Smooth transitions and hover effects
- Toast notifications for all actions

---

## 🔐 Security

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcrypt (12 rounds) |
| Authentication | JWT access + refresh tokens in httpOnly cookies |
| Rate limiting | 200 requests / 15 min per IP |
| Input validation | Server-side validation on all endpoints |
| Account lockout | 5 failed login attempts → 30 min lock |
| CORS | Whitelisted origins only |
| Helmet | HTTP security headers |
| Password reset | SHA-256 hashed token via email |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Stripe** account (for payments)
- **SMTP** credentials (for emails — Gmail, SendGrid, etc.)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/NovaMart.git
cd NovaMart

# 2. Install all dependencies (root + client + server)
npm run install:all

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, Stripe keys, SMTP config

# 4. Start development (runs client + all backend services concurrently)
npm run dev
```

The app will be available at:
| Service | URL |
|---------|-----|
| Frontend (React) | http://localhost:3000 |
| API Gateway | http://localhost:5000 |
| Auth Service | http://localhost:6001 |
| Product Service | http://localhost:6002 |
| Order Service | http://localhost:6003 |
| Seller Service | http://localhost:6004 |

### Build for Production

```bash
npm run build
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.0 | UI framework |
| Vite | 6.1 | Build tool & dev server |
| React Router | 7.x | Client-side routing |
| Tailwind CSS | 3.4 | Utility-first styling |
| Zustand | 5.x | State management |
| Axios | 1.7 | HTTP client |
| Recharts | 2.15 | Dashboard charts |
| Lucide React | 0.474 | Icon library |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20+ | Runtime |
| Express | 4.21 | Web framework |
| MongoDB / Mongoose | 8.9 | Database & ODM |
| Stripe | 17.x | Payment processing |
| JWT | 9.x | Authentication tokens |
| bcryptjs | 2.4 | Password hashing |
| Nodemailer | 6.9 | Email delivery |
| http-proxy-middleware | 3.x | API Gateway proxying |
| Helmet | 8.x | Security headers |
| node-cron | 3.x | Scheduled tasks |

---

## 📡 API Endpoints

All API requests go through the gateway at `http://localhost:5000`.

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/verify-otp` | Verify email OTP |
| POST | `/resend-otp` | Resend OTP |
| POST | `/login` | Login |
| POST | `/logout` | Logout |
| POST | `/refresh-token` | Refresh access token |
| POST | `/forgot-password` | Request password reset |
| PUT | `/reset-password/:token` | Reset password |
| GET | `/me` | Get current user |
| PUT | `/change-password` | Change password |

### Products (`/api/v1/products`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List products (with filters) |
| GET | `/:slug` | Get product by slug |
| POST | `/` | Create product (seller) |
| PUT | `/:id` | Update product (seller) |
| DELETE | `/:id` | Soft-delete product |

### Orders (`/api/v1/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create order (COD) |
| GET | `/my-orders` | Get user's orders |
| GET | `/:id` | Get order details |
| PUT | `/:id/status` | Update status (seller/admin) |
| PUT | `/:id/cancel` | Cancel order (buyer) |

### Payments (`/api/v1/payments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-checkout-session` | Start Stripe checkout |
| POST | `/webhook` | Stripe webhook handler |
| GET | `/verify/:sessionId` | Verify payment |

### Sellers (`/api/v1/sellers`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register seller |
| GET | `/shop/:slug` | Public shop profile |
| PUT | `/:id/approve` | Approve seller (admin) |
| PUT | `/:id/reject` | Reject seller (admin) |

---

## 📂 Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Server Ports
GATEWAY_PORT=5000
AUTH_SERVICE_PORT=6001
PRODUCT_SERVICE_PORT=6002
ORDER_SERVICE_PORT=6003
SELLER_SERVICE_PORT=6004

# MongoDB
MONGO_URI_AUTH=mongodb://localhost:27017/novamart_auth
MONGO_URI_PRODUCTS=mongodb://localhost:27017/novamart_products
MONGO_URI_ORDERS=mongodb://localhost:27017/novamart_orders
MONGO_URI_SELLERS=mongodb://localhost:27017/novamart_sellers

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

  **Built with ❤️ using React, Node.js, MongoDB & Stripe**

  [⬆ Back to Top](#novamart)

</div>
