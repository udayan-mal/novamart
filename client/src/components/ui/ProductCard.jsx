import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { formatPrice, truncate } from "../../lib/utils";
import useCartStore from "../../store/useCartStore";
import useWishlistStore from "../../store/useWishlistStore";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success("Added to cart");
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggle(product);
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const discounted = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = discounted
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Link to={`/products/${product.slug}`} className="card group overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={product.images?.[0] || "/placeholder.svg"}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discounted && (
            <span className="badge bg-red-500 text-white">-{discountPercent}%</span>
          )}
          {product.eventType && (
            <span className="badge bg-secondary-500 text-white capitalize">
              {product.eventType.replace("_", " ")}
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleWishlist}
            className={`p-2 rounded-full shadow-md transition-colors ${
              wishlisted
                ? "bg-red-50 text-red-500 dark:bg-red-950"
                : "bg-white dark:bg-gray-800 text-gray-600 hover:text-red-500"
            }`}
          >
            <Heart className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleAddToCart}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category}</p>
        <h3 className="font-medium text-sm leading-snug mb-2 line-clamp-2">{truncate(product.title, 60)}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 text-secondary-500 fill-secondary-500" />
          <span className="text-xs font-medium">{product.rating?.toFixed(1) || "0.0"}</span>
          <span className="text-xs text-gray-400">({product.totalReviews || 0})</span>
        </div>

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {formatPrice(discounted ? product.discountPrice : product.price)}
          </span>
          {discounted && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
