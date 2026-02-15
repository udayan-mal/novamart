import { useEffect, useState } from "react";
import { Tag, Plus, Trash2, Copy } from "lucide-react";
import api from "../../lib/api";
import { formatPrice, formatDate } from "../../lib/utils";
import toast from "react-hot-toast";

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: "", type: "percentage", value: "", minOrderAmount: "",
    maxUses: "", startDate: "", endDate: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/discounts/seller");
      setDiscounts(data.discounts || []);
    } catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/discounts", {
        ...form,
        value: parseFloat(form.value),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : 0,
        maxUses: form.maxUses ? parseInt(form.maxUses) : 0,
      });
      toast.success("Discount created");
      setShowForm(false);
      setForm({ code: "", type: "percentage", value: "", minOrderAmount: "", maxUses: "", startDate: "", endDate: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this discount?")) return;
    try {
      await api.delete(`/discounts/${id}`);
      toast.success("Deleted");
      load();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Tag className="w-6 h-6 text-primary-600" /> Discounts
        </h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Discount
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input required value={form.code} onChange={set("code")} className="input uppercase" placeholder="SAVE20" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select value={form.type} onChange={set("type")} className="input">
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value *</label>
              <input required type="number" min="0" value={form.value} onChange={set("value")} className="input" placeholder={form.type === "percentage" ? "20" : "10.00"} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Order ($)</label>
              <input type="number" min="0" value={form.minOrderAmount} onChange={set("minOrderAmount")} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Uses</label>
              <input type="number" min="0" value={form.maxUses} onChange={set("maxUses")} className="input" placeholder="0 = unlimited" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={set("startDate")} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={set("endDate")} className="input" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Creating…" : "Create"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Value</th>
                <th className="px-5 py-3 font-medium">Uses</th>
                <th className="px-5 py-3 font-medium">Valid</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">Loading…</td></tr>
              ) : discounts.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No discounts yet</td></tr>
              ) : (
                discounts.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3 font-mono font-medium uppercase">{d.code}</td>
                    <td className="px-5 py-3 capitalize">{d.type}</td>
                    <td className="px-5 py-3">{d.type === "percentage" ? `${d.value}%` : formatPrice(d.value)}</td>
                    <td className="px-5 py-3">{d.usedCount || 0} / {d.maxUses || "∞"}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {d.startDate ? formatDate(d.startDate) : "—"} → {d.endDate ? formatDate(d.endDate) : "∞"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { navigator.clipboard.writeText(d.code); toast.success("Copied!"); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(d._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
