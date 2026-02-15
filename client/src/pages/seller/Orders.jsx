import { useEffect, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../lib/api";
import { formatPrice, formatDate } from "../../lib/utils";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"];
const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  packed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  out_for_delivery: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filter) params.set("status", filter);
      const { data } = await api.get(`/orders/seller-orders?${params}`);
      setOrders(data.orders || []);
      setPagination(data.pagination || {});
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filter]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order updated to ${newStatus}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary-600" /> Orders
        </h1>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input w-auto min-w-[160px]">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">Loading…</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">No orders found</td></tr>
              ) : (
                orders.map((o) => {
                  const nextIdx = STATUS_OPTIONS.indexOf(o.status) + 1;
                  const nextStatus = nextIdx < STATUS_OPTIONS.length ? STATUS_OPTIONS[nextIdx] : null;
                  return (
                    <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-5 py-3 font-mono text-xs">{o.orderId}</td>
                      <td className="px-5 py-3">{o.items?.length || 0} items</td>
                      <td className="px-5 py-3 font-medium">{formatPrice(o.total)}</td>
                      <td className="px-5 py-3 capitalize text-xs">{o.paymentMethod} — {o.paymentStatus}</td>
                      <td className="px-5 py-3">
                        <span className={`badge capitalize ${STATUS_COLORS[o.status] || ""}`}>{o.status.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(o.createdAt)}</td>
                      <td className="px-5 py-3">
                        {nextStatus && o.status !== "cancelled" && o.status !== "delivered" ? (
                          <button onClick={() => updateStatus(o._id, nextStatus)} className="text-xs btn-primary px-3 py-1.5 capitalize">
                            → {nextStatus.replace(/_/g, " ")}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-outline p-2"><ChevronLeft className="w-4 h-4" /></button>
          <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">{page} / {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="btn-outline p-2"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
