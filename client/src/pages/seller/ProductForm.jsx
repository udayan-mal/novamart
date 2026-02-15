import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, ImagePlus, X } from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Electronics", "Fashion & Apparel", "Home & Garden", "Beauty & Health",
  "Sports & Outdoors", "Books & Media", "Toys & Games", "Automotive",
];
const EVENTS = ["", "flash_sale", "new_arrival", "best_deal", "clearance"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Orange", "Pink", "Purple", "Brown", "Gray"];

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [form, setForm] = useState({
    title: "", description: "", price: "", discountPrice: "", category: "Electronics",
    brand: "", stock: "1", colors: [], sizes: [], tags: "",
    event: "", eventStartDate: "", eventEndDate: "",
    images: [],
  });

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`).then(({ data }) => {
      const p = data.product;
      setForm({
        title: p.title, description: p.description || "", price: String(p.price),
        discountPrice: p.discountPrice ? String(p.discountPrice) : "",
        category: p.category, brand: p.brand || "", stock: String(p.stock),
        colors: p.colors || [], sizes: p.sizes || [],
        tags: (p.tags || []).join(", "), event: p.event || "",
        eventStartDate: p.eventStartDate ? p.eventStartDate.slice(0, 10) : "",
        eventEndDate: p.eventEndDate ? p.eventEndDate.slice(0, 10) : "",
        images: p.images || [],
      });
      setFetching(false);
    }).catch(() => {
      toast.error("Product not found");
      navigate("/products");
    });
  }, [id]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const toggleArray = (field, value) => {
    setForm((p) => ({
      ...p,
      [field]: p[field].includes(value) ? p[field].filter((v) => v !== value) : [...p[field], value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        stock: parseInt(form.stock),
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      };
      if (!payload.event) delete payload.event;

      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      navigate("/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/products")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isEdit ? "Edit" : "New"} Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input required value={form.title} onChange={set("title")} className="input" placeholder="Product title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea rows={4} value={form.description} onChange={set("description")} className="input" placeholder="Product description…" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select value={form.category} onChange={set("category")} className="input">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input value={form.brand} onChange={set("brand")} className="input" placeholder="Brand name" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Pricing & Stock</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price ($) *</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={set("price")} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Price</label>
              <input type="number" step="0.01" min="0" value={form.discountPrice} onChange={set("discountPrice")} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock *</label>
              <input required type="number" min="0" value={form.stock} onChange={set("stock")} className="input" />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Variants</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Colors</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => toggleArray("colors", c)} className={`text-xs px-3 py-1.5 rounded-full border transition ${form.colors.includes(c) ? "bg-primary-600 text-white border-primary-600" : "border-gray-300 dark:border-gray-700"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sizes</label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button key={s} type="button" onClick={() => toggleArray("sizes", s)} className={`text-xs px-3 py-1.5 rounded-full border transition ${form.sizes.includes(s) ? "bg-primary-600 text-white border-primary-600" : "border-gray-300 dark:border-gray-700"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <input value={form.tags} onChange={set("tags")} className="input" placeholder="trending, organic, eco-friendly" />
          </div>
        </div>

        {/* Images (URL-based for now) */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Images</h2>
          <div className="flex flex-wrap gap-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setForm((p) => ({ ...p, images: p.images.filter((_, j) => j !== i) }))} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => {
              const url = prompt("Image URL:");
              if (url) setForm((p) => ({ ...p, images: [...p.images, url] }));
            }} className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center hover:border-primary-500 transition">
              <ImagePlus className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Event */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Event / Promotion</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event</label>
              <select value={form.event} onChange={set("event")} className="input">
                {EVENTS.map((e) => <option key={e} value={e}>{e || "None"}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" value={form.eventStartDate} onChange={set("eventStartDate")} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" value={form.eventEndDate} onChange={set("eventEndDate")} className="input" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2">
            <Save className="w-4 h-4" /> {loading ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
          </button>
          <button type="button" onClick={() => navigate("/products")} className="btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}
