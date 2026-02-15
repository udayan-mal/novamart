import { useEffect, useState } from "react";
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../lib/api";

const STAT_CARDS = [
  { key: "totalOrders", label: "Total Orders", icon: ShoppingCart, color: "primary", prefix: "" },
  { key: "totalRevenue", label: "Revenue", icon: DollarSign, color: "accent", prefix: "$" },
  { key: "totalUsers", label: "Users", icon: Users, color: "secondary", prefix: "" },
  { key: "totalProducts", label: "Products", icon: Package, color: "primary", prefix: "" },
];

const MOCK_CHART = [
  { name: "Mon", orders: 32, revenue: 1820 },
  { name: "Tue", orders: 45, revenue: 2650 },
  { name: "Wed", orders: 38, revenue: 2200 },
  { name: "Thu", orders: 52, revenue: 3100 },
  { name: "Fri", orders: 61, revenue: 3800 },
  { name: "Sat", orders: 48, revenue: 2900 },
  { name: "Sun", orders: 39, revenue: 2400 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [orderStats, orders] = await Promise.all([
          api.get("/orders/stats").catch(() => ({ data: { stats: {} } })),
          api.get("/orders/all?limit=5").catch(() => ({ data: { orders: [] } })),
        ]);
        setStats({
          totalOrders: orderStats.data.stats?.totalOrders || 0,
          totalRevenue: orderStats.data.stats?.totalRevenue || 0,
          totalUsers: 0,
          totalProducts: 0,
        });
        setRecentOrders(orders.data.orders || []);
      } catch { /* ignore */ }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl bg-${card.color}-100 dark:bg-${card.color}-900/30 flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 text-${card.color}-600`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {card.prefix}{typeof stats[card.key] === "number" ? stats[card.key].toLocaleString() : stats[card.key]}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>+12.5% from last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600" /> Weekly Overview
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={MOCK_CHART}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
            <Area type="monotone" dataKey="orders" stroke="#4f46e5" fill="url(#colorOrders)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Order ID</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Items</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Total</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentOrders.length > 0 ? recentOrders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-5 py-3 font-mono text-xs">{o.orderId}</td>
                  <td className="px-5 py-3">{o.items?.length || 0} items</td>
                  <td className="px-5 py-3 font-medium">${o.total?.toFixed(2)}</td>
                  <td className="px-5 py-3"><span className="badge-primary capitalize">{o.status}</span></td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
