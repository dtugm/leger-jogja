import { create } from "zustand";

interface AppState {
  themeMode: "light" | "dark";
  sidebarOpen: boolean;
  activeFeature: string | null;
  // Actions
  setThemeMode: (mode: "light" | "dark") => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveFeature: (feature: string | null) => void;
}

/**
 * Global App Store menggunakan Zustand.
 * 
 * Zustand adalah library state management yang sangat ringan dan performant.
 * State ini bisa diakses dari mana saja di aplikasi cukup dengan:
 * 
 * const { sidebarOpen, toggleSidebar } = useAppStore();
 */
export const useAppStore = create<AppState>((set) => ({
  themeMode: "light", // In reality, handled by next-themes mostly, but good for demo
  sidebarOpen: true,
  activeFeature: null,

  setThemeMode: (mode) => set({ themeMode: mode }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  setActiveFeature: (feature) => set({ activeFeature: feature }),
}));
