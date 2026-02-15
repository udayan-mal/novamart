import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, ShieldCheck, RotateCcw, ChevronRight, Store } from "lucide-react";
import api from "../../lib/api";
import { formatPrice } from "../../lib/utils";
import useCartStore from "../../store/useCartStore";
import useWishlistStore from "../../store/useWishlistStore";
import ProductCard from "../../components/ui/ProductCard";
import { PageLoader } from "../../components/ui/Shared";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState("description");

  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlistStore();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.product);
        setSelectedColor(data.product.colors?.[0] || "");
        setSelectedSize(data.product.sizes?.[0] || "");
        setSelectedImage(0);
        setQuantity(1);

        const [rev, rel] = await Promise.all([
          api.get(`/reviews/${data.product._id}?limit=5`).catch(() => ({ data: { reviews: [] } })),
          api.get(`/products?category=${encodeURIComponent(data.product.category)}&limit=4`).catch(() => ({ data: { products: [] } })),
        ]);
        setReviews(rev.data.reviews || []);
        setRelated((rel.data.products || []).filter((p) => p._id !== data.product._id).slice(0, 4));
      } catch {
        /* 404 handled by empty product */
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedColor, selectedSize);
    toast.success("Added to cart");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/reviews/${product._id}`, { rating: reviewRating, comment: reviewText });
      toast.success("Review submitted");
      setReviewText("");
      const { data } = await api.get(`/reviews/${product._id}?limit=5`);
      setReviews(data.reviews || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  const discounted = product.discountPrice && product.discountPrice < product.price;
  const wishlisted = isWishlisted(product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-primary-600">{product.category}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
            <img
              src={product.images?.[selectedImage] || "/placeholder.svg"}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${i === selectedImage ? "border-primary-600" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-primary-600 font-medium mb-1">{product.brand || product.category}</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{product.title}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating || 0) ? "text-secondary-500 fill-secondary-500" : "text-gray-300"}`} />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating?.toFixed(1) || "0.0"}</span>
            <span className="text-sm text-gray-400">({product.totalReviews || 0} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {formatPrice(discounted ? product.discountPrice : product.price)}
            </span>
            {discounted && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                <span className="badge bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                  Save {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Color: <span className="text-gray-500">{selectedColor}</span></p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${selectedColor === c ? "border-primary-600 bg-primary-50 dark:bg-primary-950 text-primary-700" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Size: <span className="text-gray-500">{selectedSize}</span></p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium border transition-colors ${selectedSize === s ? "border-primary-600 bg-primary-50 dark:bg-primary-950 text-primary-700" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800"><Minus className="w-4 h-4" /></button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50">
              <ShoppingCart className="w-4 h-4" /> {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={() => { toggle(product); toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist"); }}
              className={`p-3 rounded-lg border transition-colors ${wishlisted ? "border-red-300 bg-red-50 text-red-500 dark:bg-red-950 dark:border-red-800" : "border-gray-200 dark:border-gray-700 hover:border-red-300 hover:text-red-500"}`}
            >
              <Heart className="w-5 h-5" fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Stock */}
          <p className={`text-sm mb-4 ${product.stock > 0 ? "text-accent-600" : "text-red-500"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {/* Shop */}
          {product.shopId && (
            <Link to={`/shop/${product.shopSlug || product.shopId}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6">
              <Store className="w-4 h-4" /> Visit Shop
            </Link>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
            <div className="text-center">
              <Truck className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Free Shipping</p>
            </div>
            <div className="text-center">
              <ShieldCheck className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Secure Payment</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">30-Day Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
        <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 mb-6">
          {["description", "specifications", "reviews"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {t} {t === "reviews" && `(${product.totalReviews || 0})`}
            </button>
          ))}
        </div>

        {tab === "description" && (
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
            <p>{product.description || "No description available."}</p>
          </div>
        )}

        {tab === "specifications" && (
          <div className="max-w-lg">
            {product.specifications?.length > 0 ? (
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 font-medium text-gray-500 w-1/3">{spec.key}</td>
                      <td className="py-2">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">No specifications listed.</p>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div>
            {/* Review form */}
            <form onSubmit={handleSubmitReview} className="card p-4 mb-6 max-w-lg">
              <h4 className="font-semibold text-sm mb-3">Write a Review</h4>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setReviewRating(s)}>
                    <Star className={`w-5 h-5 ${s <= reviewRating ? "text-secondary-500 fill-secondary-500" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="input text-sm mb-3"
                required
              />
              <button type="submit" disabled={submitting} className="btn-primary text-sm py-2 disabled:opacity-50">
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>

            {/* Reviews list */}
            {reviews.length > 0 ? (
              <div className="space-y-4 max-w-2xl">
                {reviews.map((r) => (
                  <div key={r._id} className="border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-secondary-500 fill-secondary-500" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm">{r.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
            )}
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6">Related Products</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
