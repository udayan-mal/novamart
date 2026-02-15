import { useEffect, useState } from "react";
import { ShoppingCart, Search, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../lib/api";
import { formatDate, formatPrice } from "../../lib/utils";

const STATUS_COLORS = {
  pending: "badge-warning",
  confirmed: "badge-primary",
  packed: "badge-primary",
  shipped: "badge-primary",
  out_for_delivery: "badge-primary",
  delivered: "badge-success",
  cancelled: "badge-danger",
  returned: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await api.get(`/orders/all?${params}`);
      setOrders(data.orders || []);
      setPagination(data.pagination || {});
    } catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary-600" /> All Orders
        </h1>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input w-auto min-w-[160px] py-2">
          <option value="">All Statuses</option>
          {["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Order ID</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Items</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Total</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Payment</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-mono text-xs">{o.orderId}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3">{o.items?.length || 0}</td>
                    <td className="px-5 py-3 font-medium">{formatPrice(o.total)}</td>
                    <td className="px-5 py-3">
                      <span className={o.paymentStatus === "paid" ? "badge-success" : "badge-warning"}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${STATUS_COLORS[o.status] || ""} capitalize`}>
                        {o.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-outline p-2"><ChevronLeft className="w-4 h-4" /></button>
          <span className="flex items-center px-4 text-sm text-gray-500">Page {page} of {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="btn-outline p-2"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
