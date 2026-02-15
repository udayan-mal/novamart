import { Settings as SettingsIcon, Globe, Palette, Bell, Shield, Save } from "lucide-react";
import { useState } from "react";
import useThemeStore from "../../store/useThemeStore";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const { theme, setTheme } = useThemeStore();
  const [siteName, setSiteName] = useState("NovaMart");
  const [platformFee, setPlatformFee] = useState("10");

  const handleSave = () => {
    toast.success("Settings saved (demo)");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-primary-600" /> Settings
      </h1>

      {/* General */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-400" /> General
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name</label>
          <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="input max-w-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform Fee (%)</label>
          <input type="number" min="0" max="50" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} className="input max-w-[120px]" />
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-gray-400" /> Appearance
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
          <div className="flex gap-3">
            {[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition ${
                  theme === opt.value
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-400" /> Security
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
          <p>• Rate limiting: 200 requests per 15 minutes per IP</p>
          <p>• Password policy: Min 8 chars, uppercase, lowercase, digit, special char</p>
          <p>• Account lockout: 5 failed attempts → 30 min lock</p>
          <p>• JWT access tokens expire in 15 minutes</p>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary inline-flex items-center gap-2">
        <Save className="w-4 h-4" /> Save Settings
      </button>
    </div>
  );
}
