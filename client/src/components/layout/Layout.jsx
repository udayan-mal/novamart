import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import useAuthStore from "../../store/useAuthStore";
import useThemeStore from "../../store/useThemeStore";

export default function Layout() {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const initTheme = useThemeStore((s) => s.init);

  useEffect(() => {
    initTheme();
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
