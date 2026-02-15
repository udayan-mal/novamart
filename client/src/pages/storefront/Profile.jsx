import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Camera, Lock, Plus, Trash2, Save } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import api from "../../lib/api";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, fetchUser } = useAuthStore();
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    if (user) setProfile({ name: user.name, email: user.email, phone: user.phone || "" });
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/users/profile", { name: profile.name, phone: profile.phone });
      await fetchUser();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await api.put("/auth/change-password", { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "profile", label: "Profile", icon: User },
    { key: "addresses", label: "Addresses", icon: MapPin },
    { key: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Account</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-8">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium flex-1 transition ${tab === t.key ? "bg-white dark:bg-gray-700 text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <form onSubmit={handleProfileUpdate} className="card p-6 space-y-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-2xl font-bold text-primary-600">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={profile.email} readOnly className="input pl-10 bg-gray-50 dark:bg-gray-800 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input pl-10" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2">
            <Save className="w-4 h-4" /> {loading ? "Saving…" : "Save Changes"}
          </button>
        </form>
      )}

      {/* Addresses Tab */}
      {tab === "addresses" && <AddressesTab user={user} fetchUser={fetchUser} />}

      {/* Security Tab */}
      {tab === "security" && (
        <form onSubmit={handleChangePassword} className="card p-6 space-y-4 max-w-md">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input type="password" required value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input type="password" required value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
            <input type="password" required value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="input" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Changing…" : "Change Password"}
          </button>
        </form>
      )}
    </div>
  );
}

/* ── Addresses sub-component ── */
function AddressesTab({ user, fetchUser }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", street: "", city: "", state: "", zipCode: "", country: "US" });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const addresses = user?.shippingAddresses || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users/shipping-address", form);
      await fetchUser();
      setShowForm(false);
      setForm({ fullName: "", phone: "", street: "", city: "", state: "", zipCode: "", country: "US" });
      toast.success("Address added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/shipping-address/${id}`);
      await fetchUser();
      toast.success("Address removed");
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Saved Addresses</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-outline text-sm inline-flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-5 grid sm:grid-cols-2 gap-3">
          <input required value={form.fullName} onChange={set("fullName")} placeholder="Full name" className="input" />
          <input required value={form.phone} onChange={set("phone")} placeholder="Phone" className="input" />
          <input required value={form.street} onChange={set("street")} placeholder="Street" className="input sm:col-span-2" />
          <input required value={form.city} onChange={set("city")} placeholder="City" className="input" />
          <input required value={form.state} onChange={set("state")} placeholder="State" className="input" />
          <input required value={form.zipCode} onChange={set("zipCode")} placeholder="ZIP" className="input" />
          <input required value={form.country} onChange={set("country")} placeholder="Country" className="input" />
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary text-sm">{loading ? "Saving…" : "Save Address"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancel</button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm && (
        <div className="card p-8 text-center text-gray-500">No saved addresses</div>
      )}

      {addresses.map((addr) => (
        <div key={addr._id} className="card p-4 flex justify-between items-start">
          <div className="text-sm">
            <p className="font-medium text-gray-900 dark:text-white">{addr.fullName}</p>
            <p className="text-gray-500">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
            <p className="text-gray-400">{addr.phone}</p>
          </div>
          <button onClick={() => handleDelete(addr._id)} className="text-red-500 hover:text-red-600 p-1">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
