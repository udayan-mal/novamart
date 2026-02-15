import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Tag, BarChart3,
  Settings, Store, CreditCard,
} from "lucide-react";

const NAV = [
  { to: "/seller", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/seller/products", icon: Package, label: "Products" },
  { to: "/seller/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/seller/discounts", icon: Tag, label: "Discounts" },
  { to: "/seller/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/seller/payouts", icon: CreditCard, label: "Payouts" },
  { to: "/seller/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200 dark:border-gray-800">
        <Store className="w-7 h-7 text-primary-600" />
        <span className="text-lg font-bold text-gray-900 dark:text-white">Seller Hub</span>
      </div>

      {/* Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/seller"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400">
        NovaMart Seller v1.0
      </div>
    </aside>
  );
}
