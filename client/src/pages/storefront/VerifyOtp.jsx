import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";

export default function VerifyOtp() {
  const { state } = useLocation();
  const email = state?.email || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { email, otp });
      toast.success("Email verified! You can now sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/auth/resend-otp", { email });
      toast.success("New OTP sent to your email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="w-14 h-14 bg-accent-100 dark:bg-accent-900/40 rounded-xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7 text-accent-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verify Your Email</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          We sent a 6-digit code to <span className="font-medium text-gray-900 dark:text-white">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-5">
          <input
            type="text"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="input text-center text-2xl tracking-[0.5em] font-mono"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Verifying…" : "Verify OTP"}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          className="text-sm text-primary-600 hover:underline mt-4 disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}
