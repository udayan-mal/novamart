import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import useCartStore from "../../store/useCartStore";
import { formatPrice } from "../../lib/utils";
import { EmptyState } from "../../components/ui/Shared";

export default function Cart() {
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();

  const subtotal = getSubtotal();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          action={<Link to="/products" className="btn-primary inline-flex items-center gap-2">Start Shopping <ArrowRight className="w-4 h-4" /></Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart ({items.length})</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear Cart</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.key} className="card p-4 flex gap-4">
              <Link to={`/products/${item.slug}`} className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.slug}`} className="font-medium text-sm hover:text-primary-600 line-clamp-2">{item.title}</Link>
                {(item.selectedColor || item.selectedSize) && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.selectedColor && `Color: ${item.selectedColor}`}
                    {item.selectedColor && item.selectedSize && " · "}
                    {item.selectedSize && `Size: ${item.selectedSize}`}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</span>
                    <button onClick={() => removeItem(item.key)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>{shipping === 0 ? <span className="text-accent-600 font-medium">Free</span> : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Free shipping on orders over $50</p>
              )}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full mt-6 text-center block">
              Proceed to Checkout
            </Link>
            <Link to="/products" className="text-sm text-center text-gray-500 hover:text-primary-600 mt-3 block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
