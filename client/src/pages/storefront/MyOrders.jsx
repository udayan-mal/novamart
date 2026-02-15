import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../lib/api";
import { formatPrice, formatDate } from "../../lib/utils";
import { PageLoader } from "../../components/ui/Shared";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  packed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  out_for_delivery: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  returned: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await api.get(`/orders/my-orders?${params}`);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-primary-600" /> My Orders
        </h1>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input w-auto min-w-[160px]">
          <option value="">All Statuses</option>
          {["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No orders found</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order <span className="font-mono font-medium text-gray-900 dark:text-white">{order.orderId}</span></p>
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || ""}`}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatPrice(order.total)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {order.items.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <img src={item.image || "/placeholder.svg"} alt="" className="w-8 h-8 rounded object-cover" />
                    <div>
                      <p className="text-xs font-medium truncate max-w-[120px]">{item.title}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
                {order.items.length > 4 && <span className="text-xs text-gray-400 self-center">+{order.items.length - 4} more</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-outline p-2"><ChevronLeft className="w-4 h-4" /></button>
          <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">Page {page} of {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="btn-outline p-2"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
