import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import api from "../../lib/api";
import useCartStore from "../../store/useCartStore";
import { formatPrice } from "../../lib/utils";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!sessionId);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
    if (!sessionId) return;
    api
      .get(`/payments/verify/${sessionId}`)
      .then(({ data }) => setOrder(data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
      <div className="card max-w-lg w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Thank you for your order. You will receive a confirmation email shortly.
        </p>

        {loading && <p className="text-sm text-gray-500">Verifying payment…</p>}

        {order && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left mb-6 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Order ID</span><span className="font-mono font-medium">{order.orderId}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-medium">{formatPrice(order.total)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="capitalize font-medium">{order.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="capitalize text-primary-600 font-medium">{order.status}</span></div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/my-orders" className="btn-primary inline-flex items-center gap-2">
            <Package className="w-4 h-4" /> View My Orders
          </Link>
          <Link to="/products" className="btn-outline inline-flex items-center gap-2">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
