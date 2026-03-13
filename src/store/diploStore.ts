import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { DiploMessage, DiploGroup } from "@/types";

interface DiploState {
  // Channels: each nation has its own message history
  histories: Record<string, DiploMessage[]>;

  // Current channel (can contain multiple nation IDs for group)
  activeChannel: string[];

  // Saved groups (coalitions, blocs)
  groups: DiploGroup[];

  addToChannel: (nationId: string) => void;
  removeFromChannel: (nationId: string) => void;
  clearChannel: () => void;
  loadGroup: (groupId: string) => void;
  saveGroup: (name: string, nationIds: string[]) => void;
  deleteGroup: (groupId: string) => void;
  addMessage: (nationId: string, msg: DiploMessage) => void;
  getHistory: (nationId: string) => DiploMessage[];
}

export const useDiploStore = create<DiploState>()(
  immer((set, get) => ({
    histories: {},
    activeChannel: [],
    groups: [],

    addToChannel: (id) =>
      set((state) => {
        if (!state.activeChannel.includes(id)) state.activeChannel.push(id);
      }),

    removeFromChannel: (id) =>
      set((state) => {
        state.activeChannel = state.activeChannel.filter((x) => x !== id);
      }),

    clearChannel: () =>
      set((state) => {
        state.activeChannel = [];
      }),

    loadGroup: (groupId) =>
      set((state) => {
        const group = state.groups.find((g) => g.id === groupId);
        if (group) state.activeChannel = [...group.nationIds];
      }),

    saveGroup: (name, nationIds) =>
      set((state) => {
        state.groups.push({
          id: Date.now().toString(),
          name,
          nationIds: [...nationIds],
          createdAt: Date.now(),
        });
      }),

    deleteGroup: (groupId) =>
      set((state) => {
        state.groups = state.groups.filter((g) => g.id !== groupId);
      }),

    addMessage: (nationId, msg) =>
      set((state) => {
        if (!state.histories[nationId]) state.histories[nationId] = [];
        state.histories[nationId].push(msg);
      }),

    getHistory: (nationId) => get().histories[nationId] || [],
  })),
);
