import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import api from "../../lib/api";
import ProductCard from "../../components/ui/ProductCard";
import { PageLoader, EmptyState } from "../../components/ui/Shared";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low → High" },
  { value: "price_high", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
  { value: "best_selling", label: "Best Selling" },
];

const CATEGORIES = ["Electronics", "Fashion", "Home & Garden", "Beauty", "Sports", "Books", "Toys & Games", "Automotive"];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || "",
    sort: searchParams.get("sort") || "newest",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    rating: searchParams.get("rating") || "",
    event: searchParams.get("event") || "",
    featured: searchParams.get("featured") || "",
    page: parseInt(searchParams.get("page")) || 1,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params, { replace: true });

    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products?${params.toString()}&limit=12`);
        setProducts(data.products || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [filters]);

  const updateFilter = (key, value) => setFilters((p) => ({ ...p, [key]: value, page: 1 }));
  const clearFilters = () =>
    setFilters({ category: "", search: "", sort: "newest", minPrice: "", maxPrice: "", rating: "", event: "", featured: "", page: 1 });

  const activeCount = [filters.category, filters.minPrice, filters.maxPrice, filters.rating, filters.event, filters.featured].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">
            {filters.search ? `Results for "${filters.search}"` : filters.category || "All Products"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="input py-2 text-sm w-44"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button onClick={() => setFiltersOpen((p) => !p)} className="btn-outline py-2 px-3 text-sm inline-flex items-center gap-1.5 lg:hidden">
            <SlidersHorizontal className="w-4 h-4" /> Filters {activeCount > 0 && `(${activeCount})`}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={`${filtersOpen ? "fixed inset-0 z-50 bg-white dark:bg-gray-950 p-6 overflow-auto" : "hidden"} lg:block lg:static lg:w-56 flex-shrink-0`}>
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h3 className="font-bold text-lg">Filters</h3>
            <button onClick={() => setFiltersOpen(false)}><X className="w-5 h-5" /></button>
          </div>

          {activeCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-primary-600 hover:underline mb-4 block">
              Clear all filters
            </button>
          )}

          {/* Category */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm mb-2 uppercase tracking-wider text-gray-500">Category</h4>
            <div className="space-y-1.5">
              {CATEGORIES.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === c}
                    onChange={() => updateFilter("category", filters.category === c ? "" : c)}
                    className="accent-primary-600"
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm mb-2 uppercase tracking-wider text-gray-500">Price Range</h4>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} className="input py-1.5 text-sm w-20" />
              <span className="text-gray-400">-</span>
              <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} className="input py-1.5 text-sm w-20" />
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm mb-2 uppercase tracking-wider text-gray-500">Min Rating</h4>
            <div className="space-y-1.5">
              {[4, 3, 2, 1].map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === String(r)}
                    onChange={() => updateFilter("rating", filters.rating === String(r) ? "" : String(r))}
                    className="accent-primary-600"
                  />
                  {"★".repeat(r)}{"☆".repeat(5 - r)} & up
                </label>
              ))}
            </div>
          </div>

          <button onClick={() => setFiltersOpen(false)} className="btn-primary w-full lg:hidden mt-4">
            Apply Filters
          </button>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <PageLoader />
          ) : products.length === 0 ? (
            <EmptyState title="No products found" description="Try adjusting your filters or search query." />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        p === pagination.page
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
