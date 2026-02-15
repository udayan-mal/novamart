import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, Headphones, RotateCcw, Zap, TrendingUp } from "lucide-react";
import api from "../../lib/api";
import ProductCard from "../../components/ui/ProductCard";
import { SectionHeader, PageLoader } from "../../components/ui/Shared";

const FEATURES = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "100% protected" },
  { icon: Headphones, title: "24/7 Support", desc: "Dedicated help" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day policy" },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newest, setNewest] = useState([]);
  const [flashSale, setFlashSale] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [f, n, fs] = await Promise.all([
          api.get("/products?featured=true&limit=8"),
          api.get("/products?sort=newest&limit=8"),
          api.get("/products?event=flash_sale&limit=8"),
        ]);
        setFeatured(f.data.products || []);
        setNewest(n.data.products || []);
        setFlashSale(fs.data.products || []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-96 h-96 -top-20 -left-20 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute w-96 h-96 -bottom-20 -right-20 rounded-full bg-accent-300/30 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-sm font-medium mb-6">
              <Zap className="w-4 h-4 text-secondary-400" /> New Season Collection
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Shop the Best <br />
              <span className="text-secondary-400">Multi-Vendor</span> Marketplace
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg">
              Discover thousands of products from verified sellers. Quality guaranteed, fast delivery, and unbeatable prices.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn-secondary inline-flex items-center gap-2">
                Explore Products <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/products?event=flash_sale" className="bg-white/15 hover:bg-white/25 backdrop-blur text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
                Flash Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Flash Sale ── */}
      {flashSale.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SectionHeader
            title="⚡ Flash Sale"
            subtitle="Limited time deals — grab them before they're gone!"
            action={
              <Link to="/products?event=flash_sale" className="text-sm font-medium text-primary-600 hover:underline inline-flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {flashSale.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Featured Products ── */}
      {featured.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Featured Products"
              subtitle="Hand-picked by our team for quality and value"
              action={
                <Link to="/products?featured=true" className="text-sm font-medium text-primary-600 hover:underline inline-flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              }
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Category Highlights ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader title="Shop by Category" subtitle="Find exactly what you need" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { name: "Electronics", emoji: "💻", color: "from-blue-500 to-cyan-500" },
            { name: "Fashion", emoji: "👗", color: "from-pink-500 to-rose-500" },
            { name: "Home & Garden", emoji: "🏠", color: "from-green-500 to-emerald-500" },
            { name: "Beauty", emoji: "💄", color: "from-purple-500 to-fuchsia-500" },
            { name: "Sports", emoji: "⚽", color: "from-orange-500 to-amber-500" },
            { name: "Books", emoji: "📚", color: "from-indigo-500 to-violet-500" },
            { name: "Toys & Games", emoji: "🎮", color: "from-red-500 to-pink-500" },
            { name: "Automotive", emoji: "🚗", color: "from-gray-600 to-slate-500" },
          ].map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br ${cat.color} p-6 text-white shadow-md hover:shadow-lg transition-shadow"
              style={{
                backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90`} />
              <div className="relative">
                <span className="text-3xl mb-2 block">{cat.emoji}</span>
                <span className="font-semibold">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── New Arrivals ── */}
      {newest.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="New Arrivals"
              subtitle="Fresh products just for you"
              action={
                <Link to="/products?sort=newest" className="text-sm font-medium text-primary-600 hover:underline inline-flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              }
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {newest.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Become a Seller CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 sm:p-12 text-white text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Start Selling on NovaMart</h2>
          <p className="text-white/80 max-w-md mx-auto mb-6">
            Join thousands of sellers and reach millions of customers. Set up your shop in minutes.
          </p>
          <a href={import.meta.env.VITE_SELLER_DASHBOARD_URL || "http://localhost:3001"} className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
            Open Your Shop <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </>
  );
}
