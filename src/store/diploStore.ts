import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { uid } from '@/lib/utils'
import type { DiploMessage, DiploGroup, IncomingMessage } from '@/types'

interface DiploState {
  histories: Record<string, DiploMessage[]>
  activeChannel: string[]
  groups: DiploGroup[]
  incomingMessages: IncomingMessage[]
  unreadCount: number

  addToChannel: (nationId: string) => void
  removeFromChannel: (nationId: string) => void
  clearChannel: () => void
  loadGroup: (groupId: string) => void
  saveGroup: (name: string, nationIds: string[]) => void
  deleteGroup: (groupId: string) => void
  addMessage: (nationId: string, msg: Omit<DiploMessage, 'id'>) => void
  getHistory: (nationId: string) => DiploMessage[]
  clearHistory: () => void
  addIncoming: (msg: Omit<IncomingMessage, 'id'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
}

export const useDiploStore = create<DiploState>()(
  immer((set, get) => ({
    histories: {},
    activeChannel: [],
    groups: [],
    incomingMessages: [],
    unreadCount: 0,

    addToChannel: (id) => set((s) => {
      if (!s.activeChannel.includes(id)) s.activeChannel.push(id)
    }),

    removeFromChannel: (id) => set((s) => {
      s.activeChannel = s.activeChannel.filter((x) => x !== id)
    }),

    clearChannel: () => set((s) => { s.activeChannel = [] }),

    loadGroup: (groupId) => set((s) => {
      const group = s.groups.find((g) => g.id === groupId)
      if (group) s.activeChannel = [...group.nationIds]
    }),

    saveGroup: (name, nationIds) => set((s) => {
      s.groups.push({ id: uid(), name, nationIds: [...nationIds], createdAt: Date.now() })
    }),

    deleteGroup: (groupId) => set((s) => {
      s.groups = s.groups.filter((g) => g.id !== groupId)
    }),

    addMessage: (nationId, msg) => set((s) => {
      if (!s.histories[nationId]) s.histories[nationId] = []
      s.histories[nationId].push({ ...msg, id: uid() })
    }),

    getHistory: (nationId) => get().histories[nationId] ?? [],

    clearHistory: () => set((s) => { s.histories = {} }),

    addIncoming: (msg) => set((s) => {
      s.incomingMessages.unshift({ ...msg, id: uid() })
      s.unreadCount = s.incomingMessages.filter(m => !m.read).length
    }),

    markRead: (id) => set((s) => {
      const m = s.incomingMessages.find(m => m.id === id)
      if (m) m.read = true
      s.unreadCount = s.incomingMessages.filter(m => !m.read).length
    }),

    markAllRead: () => set((s) => {
      s.incomingMessages.forEach(m => { m.read = true })
      s.unreadCount = 0
    }),
  }))
)
