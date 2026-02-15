import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import useSellerAuthStore from "../../store/useSellerAuthStore";

export default function DashboardLayout({ requiredRole = "seller" }) {
  const { seller, loading, fetchSeller } = useSellerAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSeller();
  }, []);

  useEffect(() => {
    if (!loading && !seller) navigate("/seller/login");
  }, [loading, seller, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!seller) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar role={requiredRole} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
