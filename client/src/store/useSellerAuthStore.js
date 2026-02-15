import { create } from "zustand";
import api from "../lib/api";

const useSellerAuthStore = create((set) => ({
  seller: null,
  loading: true,

  fetchSeller: async () => {
    try {
      const { data } = await api.get("/sellers/me");
      set({ seller: data.seller, loading: false });
    } catch {
      set({ seller: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.user?.role !== "seller" && data.user?.role !== "admin") {
      await api.post("/auth/logout");
      throw new Error("Access restricted to sellers only");
    }
    set({ seller: data.user });
    return data;
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ seller: null });
  },

  setSeller: (seller) => set({ seller }),
}));

export default useSellerAuthStore;
