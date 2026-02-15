import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, MapPin, Truck } from "lucide-react";
import useCartStore from "../../store/useCartStore";
import useAuthStore from "../../store/useAuthStore";
import api from "../../lib/api";
import { formatPrice } from "../../lib/utils";
import toast from "react-hot-toast";

export default function Checkout() {
  const { items, subtotal, clearCart, coupon } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });

  useEffect(() => {
    if (items.length === 0) navigate("/cart");
  }, [items, navigate]);

  const set = (key) => (e) => setAddress((p) => ({ ...p, [key]: e.target.value }));

  const shippingCost = subtotal() >= 50 ? 0 : 5.99;
  const tax = +(subtotal() * 0.08).toFixed(2);
  const discount = coupon?.discountAmount || 0;
  const total = +(subtotal() + shippingCost + tax - discount).toFixed(2);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      return toast.error("Please fill in all address fields");
    }
    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        shopId: i.shopId,
        title: i.title,
        image: i.image,
        price: i.discountPrice || i.price,
        quantity: i.quantity,
        selectedColor: i.selectedColor,
        selectedSize: i.selectedSize,
      }));

      if (paymentMethod === "stripe") {
        const { data } = await api.post("/payments/create-checkout-session", {
          items: orderItems,
          shippingAddress: address,
          couponCode: coupon?.code || "",
          discount,
          tax,
          shippingCost,
        });
        window.location.href = data.url;
      } else {
        await api.post("/orders", {
          items: orderItems,
          shippingAddress: address,
          subtotal: subtotal(),
          shippingCost,
          tax,
          discount,
          total,
          paymentMethod: "cod",
          couponCode: coupon?.code || "",
        });
        clearCart();
        navigate("/order/success");
        toast.success("Order placed successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-8">
        {/* Left — Address + Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
              <MapPin className="w-5 h-5 text-primary-600" /> Shipping Address
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input required value={address.fullName} onChange={set("fullName")} placeholder="Full name" className="input" />
              <input required value={address.phone} onChange={set("phone")} placeholder="Phone number" className="input" />
              <input required value={address.street} onChange={set("street")} placeholder="Street address" className="input sm:col-span-2" />
              <input required value={address.city} onChange={set("city")} placeholder="City" className="input" />
              <input required value={address.state} onChange={set("state")} placeholder="State / Province" className="input" />
              <input required value={address.zipCode} onChange={set("zipCode")} placeholder="ZIP / Postal code" className="input" />
              <input required value={address.country} onChange={set("country")} placeholder="Country" className="input" />
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
              <CreditCard className="w-5 h-5 text-primary-600" /> Payment Method
            </h2>
            <div className="space-y-3">
              {[
                { id: "stripe", label: "Credit / Debit Card (Stripe)", desc: "Secure online payment" },
                { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
              ].map((m) => (
                <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === m.id ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700"}`}>
                  <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="accent-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{m.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Order Summary */}
        <div className="card p-6 h-fit sticky top-24">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>

          <div className="divide-y divide-gray-100 dark:divide-gray-700 mb-4 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-3 py-3">
                <img src={item.image || "/placeholder.svg"} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">x{item.quantity}</p>
                </div>
                <p className="text-sm font-medium">{formatPrice((item.discountPrice || item.price) * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(subtotal())}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatPrice(tax)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
            <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100 dark:border-gray-700">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
            <Truck className="w-5 h-5" />
            {loading ? "Processing…" : paymentMethod === "stripe" ? "Pay with Stripe" : "Place Order (COD)"}
          </button>
        </div>
      </form>
    </div>
  );
}
