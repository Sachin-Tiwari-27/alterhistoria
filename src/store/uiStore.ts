import { create } from "zustand";

type Tab = "advisor" | "diplomacy" | "events" | "jump";

interface UIState {
  activeTab: Tab;
  showNationSelect: boolean;
  showApiModal: boolean;
  showPolityEditor: boolean;
  theme: "light" | "dark";
  setTab: (tab: Tab) => void;
  setShowNationSelect: (v: boolean) => void;
  setShowApiModal: (v: boolean) => void;
  setShowPolityEditor: (v: boolean) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: "advisor",
  showNationSelect: false,
  showApiModal: true,
  showPolityEditor: false,
  theme: "dark",
  setTab: (tab) => set({ activeTab: tab }),
  setShowNationSelect: (v) => set({ showNationSelect: v }),
  setShowApiModal: (v) => set({ showApiModal: v }),
  setShowPolityEditor: (v) => set({ showPolityEditor: v }),
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
}));
