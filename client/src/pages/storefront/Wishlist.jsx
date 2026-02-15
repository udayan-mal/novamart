import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import useWishlistStore from "../../store/useWishlistStore";
import useCartStore from "../../store/useCartStore";
import { formatPrice } from "../../lib/utils";
import { EmptyState } from "../../components/ui/Shared";
import toast from "react-hot-toast";

export default function Wishlist() {
  const { items, toggle, clear } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save products you love for later."
          action={<Link to="/products" className="btn-primary inline-flex items-center gap-2">Browse Products <ArrowRight className="w-4 h-4" /></Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Wishlist ({items.length})</h1>
        <button onClick={clear} className="text-sm text-red-500 hover:underline">Clear All</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((product) => (
          <div key={product._id} className="card overflow-hidden flex flex-col">
            <Link to={`/products/${product.slug}`} className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img src={product.images?.[0] || "/placeholder.svg"} alt={product.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
            </Link>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-sm font-medium line-clamp-2 mb-2">{product.title}</h3>
              <p className="text-lg font-bold text-primary-600 mt-auto mb-3">
                {formatPrice(product.discountPrice || product.price)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { addItem(product); toast.success("Added to cart"); }}
                  className="btn-primary flex-1 text-sm py-2 inline-flex items-center justify-center gap-1"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Add
                </button>
                <button
                  onClick={() => { toggle(product); toast.success("Removed from wishlist"); }}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
