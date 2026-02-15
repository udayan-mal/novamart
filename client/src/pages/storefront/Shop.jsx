import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Store, Star, Users, Package } from "lucide-react";
import api from "../../lib/api";
import ProductCard from "../../components/ui/ProductCard";
import { PageLoader, SectionHeader } from "../../components/ui/Shared";

export default function Shop() {
  const { slug } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        const [s, p] = await Promise.all([
          api.get(`/sellers/shop/${slug}`),
          api.get(`/products?shopSlug=${slug}&limit=12&page=${page}`),
        ]);
        setSeller(s.data.seller);
        setProducts(p.data.products || []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, page]);

  if (loading) return <PageLoader />;
  if (!seller) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Shop not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Shop Header */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-bold">
              {seller.shopName?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold">{seller.shopName}</h1>
              {seller.description && <p className="text-white/80 mt-1 max-w-xl">{seller.description}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/70">
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-300" /> {seller.rating?.toFixed(1) || "N/A"}</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {seller.followers?.length || 0} followers</span>
                <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {products.length}+ products</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SectionHeader title="All Products" />
        {products.length === 0 ? (
          <div className="card p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">This shop has no products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
