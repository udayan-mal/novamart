import { create } from "zustand";

const getInitial = () => {
  const saved = localStorage.getItem("novamart-theme");
  if (saved) return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const useThemeStore = create((set) => ({
  theme: getInitial(),

  setTheme: (theme) => {
    localStorage.setItem("novamart-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },

  toggle: () => {
    const isDark = document.documentElement.classList.contains("dark");
    const next = isDark ? "light" : "dark";
    localStorage.setItem("novamart-theme", next);
    document.documentElement.classList.toggle("dark", !isDark);
    set({ theme: next });
  },
}));

export default useThemeStore;
