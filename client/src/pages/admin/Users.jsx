import { useEffect, useState } from "react";
import { Users as UsersIcon, Search, Ban, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users?page=${page}&limit=15`);
      setUsers(data.users || []);
      setPagination(data.pagination || {});
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, [page]);

  const handleToggleBan = async (id) => {
    try {
      await api.put(`/users/${id}/toggle-ban`);
      toast.success("User status updated");
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const filtered = search
    ? users.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UsersIcon className="w-6 h-6 text-primary-600" /> User Management
        </h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10 py-2" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Role</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-xs font-bold text-primary-700">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${u.role === "admin" ? "badge-primary" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={u.isBanned ? "badge-danger" : "badge-success"}>{u.isBanned ? "Banned" : "Active"}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {u.role !== "admin" && (
                        <button onClick={() => handleToggleBan(u._id)} className={`text-xs font-medium px-3 py-1 rounded-lg ${u.isBanned ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30" : "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"}`}>
                          {u.isBanned ? "Unban" : "Ban"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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
