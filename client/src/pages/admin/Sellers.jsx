import { useEffect, useState } from "react";
import { Store, Search, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/sellers?page=${page}&limit=15`);
      setSellers(data.sellers || []);
      setPagination(data.pagination || {});
    } catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/sellers/${id}/${action}`);
      toast.success(`Seller ${action}d`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Store className="w-6 h-6 text-primary-600" /> Seller Management
      </h1>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Shop Name</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Products</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sellers.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{s.shopName}</td>
                    <td className="px-5 py-3 text-gray-500">{s.email}</td>
                    <td className="px-5 py-3">
                      <span className={s.isApproved ? "badge-success" : s.isRejected ? "badge-danger" : "badge-warning"}>
                        {s.isApproved ? "Approved" : s.isRejected ? "Rejected" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{s.totalProducts || 0}</td>
                    <td className="px-5 py-3 text-right space-x-2">
                      {!s.isApproved && (
                        <button onClick={() => handleAction(s._id, "approve")} className="text-xs font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 px-3 py-1 rounded-lg">
                          <CheckCircle className="w-4 h-4 inline mr-1" />Approve
                        </button>
                      )}
                      {!s.isRejected && (
                        <button onClick={() => handleAction(s._id, "reject")} className="text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1 rounded-lg">
                          <XCircle className="w-4 h-4 inline mr-1" />Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {sellers.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No sellers found</td></tr>
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
