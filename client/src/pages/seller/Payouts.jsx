import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import api from "../../lib/api";
import { formatPrice, formatDate } from "../../lib/utils";

export default function Payouts() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/payments/history")
      .then(({ data }) => setPayments(data.payments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-primary-600" /> Payouts & Payments
      </h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">Loading…</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No payments yet</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3 font-mono text-xs">{p.orderId}</td>
                    <td className="px-5 py-3 font-medium">{formatPrice(p.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`badge capitalize ${p.paymentStatus === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 capitalize">{p.paymentMethod}</td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(p.createdAt)}</td>
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
