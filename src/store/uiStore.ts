import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Tab = 'advisor' | 'diplomacy' | 'events' | 'jump'

interface UIState {
  activeTab: Tab
  showNationSelect: boolean
  showApiModal: boolean
  showPolityEditor: boolean
  showLeftPanel: boolean
  showRightPanel: boolean
  theme: 'light' | 'dark'
  ticker: string
  timeJumpYear: number
  timeJumpResult: string
  timeJumpLoading: boolean
  timeJumpError: string
  setTimeJumpYear: (y: number) => void
  setTimeJumpResult: (r: string) => void
  setTimeJumpLoading: (v: boolean) => void
  setTimeJumpError: (e: string) => void
  setTab: (tab: Tab) => void
  setShowNationSelect: (v: boolean) => void
  setShowApiModal: (v: boolean) => void
  setShowPolityEditor: (v: boolean) => void
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  toggleTheme: () => void
  setTicker: (text: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: 'advisor',
      showNationSelect: false,
      showApiModal: true,
      showPolityEditor: false,
      showLeftPanel: true,
      showRightPanel: true,
      theme: 'dark',
      ticker: '◆ The Great War has ended. The League of Nations convenes in Geneva. A new century begins — what will you make of it?',
      timeJumpYear: 1940,
      timeJumpResult: '',
      timeJumpLoading: false,
      timeJumpError: '',
      setTimeJumpYear: (y) => set({ timeJumpYear: y, timeJumpResult: '' }),
      setTimeJumpResult: (r) => set({ timeJumpResult: r }),
      setTimeJumpLoading: (v) => set({ timeJumpLoading: v }),
      setTimeJumpError: (e) => set({ timeJumpError: e }),
      setTab: (tab) => set({ activeTab: tab }),
      setShowNationSelect: (v) => set({ showNationSelect: v }),
      setShowApiModal: (v) => set({ showApiModal: v }),
      setShowPolityEditor: (v) => set({ showPolityEditor: v }),
      toggleLeftPanel: () => set((s) => ({ showLeftPanel: !s.showLeftPanel })),
      toggleRightPanel: () => set((s) => ({ showRightPanel: !s.showRightPanel })),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTicker: (text) => set({ ticker: text }),
    }),
    { name: 'alterhistoria-ui', partialize: (s) => ({ theme: s.theme, showLeftPanel: s.showLeftPanel, showRightPanel: s.showRightPanel, timeJumpYear: s.timeJumpYear, timeJumpResult: s.timeJumpResult }) }
  )
)
