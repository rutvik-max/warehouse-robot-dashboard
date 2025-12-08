// useThemeStore code
import { create } from "zustand";

type Theme = "light" | "dark";
export type Palette = "electric" | "ocean" | "sunset";

function applyHtmlClass(theme: Theme, palette: Palette) {
  try {
    const el = document.documentElement;
    if (!el) return;
    // dark 
    if (theme === "dark") el.classList.add("dark");
    else el.classList.remove("dark");

    // remove all palette classes
    el.classList.remove("theme-electric", "theme-ocean", "theme-sunset");
    el.classList.add(`theme-${palette}`);
  } catch (e) {
    // ignore in SSR or env without document
  }
}

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch (e) {}
  return "light";
}

function getInitialPalette(): Palette {
  try {
    const p = localStorage.getItem("palette") as Palette | null;
    if (p === "electric" || p === "ocean" || p === "sunset") return p;
  } catch (e) {}
  return "electric";
}

export const useThemeStore = create<{
  theme: Theme;
  palette: Palette;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  setPalette: (p: Palette) => void;
}>((set, get) => {
  const initialTheme = getInitialTheme();
  const initialPalette = getInitialPalette();
  applyHtmlClass(initialTheme, initialPalette);

  return {
    theme: initialTheme,
    palette: initialPalette,
    toggleTheme: () => {
      const next = get().theme === "light" ? "dark" : "light";
      try { localStorage.setItem("theme", next); } catch {}
      applyHtmlClass(next, get().palette);
      set({ theme: next });
    },
    setTheme: (t: Theme) => {
      try { localStorage.setItem("theme", t); } catch {}
      applyHtmlClass(t, get().palette);
      set({ theme: t });
    },
    setPalette: (p: Palette) => {
      try { localStorage.setItem("palette", p); } catch {}
      applyHtmlClass(get().theme, p);
      set({ palette: p });
    },
  };
});
