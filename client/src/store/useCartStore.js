import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (product, qty = 1, color = "", size = "") => {
        const items = get().items;
        const key = `${product._id}-${color}-${size}`;
        const existing = items.find((i) => i.key === key);

        if (existing) {
          set({
            items: items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + qty } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                key,
                productId: product._id,
                shopId: product.shopId,
                title: product.title,
                slug: product.slug,
                image: product.images?.[0] || "",
                price: product.discountPrice || product.price,
                originalPrice: product.price,
                quantity: qty,
                selectedColor: color,
                selectedSize: size,
                stock: product.stock,
              },
            ],
          });
        }
      },

      removeItem: (key) => {
        set({ items: get().items.filter((i) => i.key !== key) });
      },

      updateQuantity: (key, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) =>
            i.key === key ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], coupon: null }),

      setCoupon: (coupon) => set({ coupon }),

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "novamart-cart" }
  )
);

export default useCartStore;
