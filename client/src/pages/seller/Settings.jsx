import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, Store } from "lucide-react";
import useSellerAuthStore from "../../store/useSellerAuthStore";
import api from "../../lib/api";
import toast from "react-hot-toast";

export default function Settings() {
  const { seller, fetchSeller } = useSellerAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shopName: "", description: "", phone: "", address: "",
  });

  useEffect(() => {
    if (seller) {
      setForm({
        shopName: seller.shopName || seller.name || "",
        description: seller.description || "",
        phone: seller.phone || "",
        address: seller.address || "",
      });
    }
  }, [seller]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/sellers/me", form);
      await fetchSeller();
      toast.success("Settings updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-primary-600" /> Shop Settings
      </h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <Store className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{form.shopName || "Your Shop"}</h2>
            <p className="text-sm text-gray-500">{seller?.email}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Shop Name</label>
          <input value={form.shopName} onChange={set("shopName")} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea rows={3} value={form.description} onChange={set("description")} className="input" placeholder="Tell customers about your shop…" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input value={form.phone} onChange={set("phone")} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input value={form.address} onChange={set("address")} className="input" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2">
          <Save className="w-4 h-4" /> {loading ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
