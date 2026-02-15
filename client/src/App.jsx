import { Routes, Route } from "react-router-dom";

/* Layouts */
import StorefrontLayout from "./components/layout/Layout";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import AdminLayout from "./components/dashboard/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

/* Storefront pages */
import Home from "./pages/storefront/Home";
import Products from "./pages/storefront/Products";
import ProductDetail from "./pages/storefront/ProductDetail";
import Cart from "./pages/storefront/Cart";
import Wishlist from "./pages/storefront/Wishlist";
import Checkout from "./pages/storefront/Checkout";
import OrderSuccess from "./pages/storefront/OrderSuccess";
import MyOrders from "./pages/storefront/MyOrders";
import Profile from "./pages/storefront/Profile";
import Shop from "./pages/storefront/Shop";
import Login from "./pages/storefront/Login";
import Register from "./pages/storefront/Register";
import VerifyOtp from "./pages/storefront/VerifyOtp";
import ForgotPassword from "./pages/storefront/ForgotPassword";
import ResetPassword from "./pages/storefront/ResetPassword";
import NotFound from "./pages/storefront/NotFound";

/* Seller Dashboard pages */
import SellerLogin from "./pages/seller/Login";
import SellerDashboard from "./pages/seller/Dashboard";
import SellerProducts from "./pages/seller/Products";
import SellerProductForm from "./pages/seller/ProductForm";
import SellerOrders from "./pages/seller/Orders";
import SellerDiscounts from "./pages/seller/Discounts";
import SellerPayouts from "./pages/seller/Payouts";
import SellerAnalytics from "./pages/seller/Analytics";
import SellerSettings from "./pages/seller/Settings";

/* Admin Dashboard pages */
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminSellers from "./pages/admin/Sellers";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminSettings from "./pages/admin/Settings";

export default function App() {
  return (
    <Routes>
      {/* ═══ Storefront ═══ */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/shop/:slug" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/success" element={<OrderSuccess />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ═══ Seller Dashboard ═══ */}
      <Route path="/seller/login" element={<SellerLogin />} />
      <Route path="/seller" element={<DashboardLayout requiredRole="seller" />}>
        <Route index element={<SellerDashboard />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="products/new" element={<SellerProductForm />} />
        <Route path="products/edit/:id" element={<SellerProductForm />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="discounts" element={<SellerDiscounts />} />
        <Route path="payouts" element={<SellerPayouts />} />
        <Route path="analytics" element={<SellerAnalytics />} />
        <Route path="settings" element={<SellerSettings />} />
      </Route>

      {/* ═══ Admin Dashboard ═══ */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="sellers" element={<AdminSellers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
