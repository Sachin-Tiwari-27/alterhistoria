import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import type {
  PlayerNation,
  CountryBase,
  TurnAction,
  WorldEvent,
  TurnResult,
} from "@/types";
import { COUNTRIES } from "@/data/countries";

interface GameState {
  // Core
  year: number;
  quarter: number;
  turn: number;
  divergence: number;
  apiKey: string | null;

  // Nations
  player: PlayerNation | null;
  nations: Record<string, CountryBase>;

  // History
  actions: TurnAction[];
  events: WorldEvent[];

  // Actions
  setApiKey: (key: string) => void;
  startGame: (nationId: string) => void;
  applyTurnResult: (result: TurnResult) => void;
  addEvent: (event: WorldEvent) => void;

  // Polity editor
  updatePlayerNation: (patch: Partial<PlayerNation>) => void;

  // Helpers
  getPlayerDisplayName: () => string;
}

export const useGameStore = create<GameState>()(
  persist(
    immer((set, get) => ({
      year: 1920,
      quarter: 1,
      turn: 1,
      divergence: 0,
      apiKey: null,
      player: null,
      nations: JSON.parse(JSON.stringify(COUNTRIES)),
      actions: [],
      events: [],

      setApiKey: (key) =>
        set((state) => {
          state.apiKey = key;
        }),

      startGame: (nationId) =>
        set((state) => {
          const base = COUNTRIES[nationId];
          if (!base) return;
          state.player = { ...base, lore: [base.context] };
          state.nations = JSON.parse(JSON.stringify(COUNTRIES));
          state.year = 1920;
          state.quarter = 1;
          state.turn = 1;
          state.divergence = 0;
          state.actions = [];
          state.events = [];
        }),

      applyTurnResult: (result) =>
        set((state) => {
          if (!state.player) return;

          // Apply stat changes with clamping
          Object.entries(result.statChanges).forEach(([key, delta]) => {
            const k = key as keyof typeof state.player;
            if (k in state.player! && typeof delta === "number") {
              const max = k === "population" ? 5000 : 100;
              (state.player as any)[k] = Math.max(
                0,
                Math.min(max, (state.player as any)[k] + delta),
              );
            }
          });

          // Relations
          result.newFriends.forEach((id) => {
            if (!state.player!.friends.includes(id))
              state.player!.friends.push(id);
            state.player!.foes = state.player!.foes.filter((f) => f !== id);
          });
          result.newFoes.forEach((id) => {
            if (!state.player!.foes.includes(id)) state.player!.foes.push(id);
            state.player!.friends = state.player!.friends.filter(
              (f) => f !== id,
            );
          });
          result.removeFoes.forEach((id) => {
            state.player!.foes = state.player!.foes.filter((f) => f !== id);
          });

          // Append to lore
          state.player!.lore.push(result.narrative);

          state.divergence += result.divergenceDelta;

          // Advance time
          state.quarter += 1;
          if (state.quarter > 4) {
            state.quarter = 1;
            state.year += 1;
          }
          state.turn += 1;

          // Add events
          result.worldEvents.forEach((e) => state.events.unshift(e));
        }),

      addEvent: (event) =>
        set((state) => {
          state.events.unshift(event);
        }),

      updatePlayerNation: (patch) =>
        set((state) => {
          if (!state.player) return;
          Object.assign(state.player, patch);
        }),

      getPlayerDisplayName: () => {
        const p = get().player;
        if (!p) return "—";
        return p.customName || p.name;
      },
    })),
    {
      name: "alterhistoria-save",
      partialize: (state) => ({
        year: state.year,
        quarter: state.quarter,
        turn: state.turn,
        divergence: state.divergence,
        apiKey: state.apiKey,
        player: state.player,
        nations: state.nations,
        actions: state.actions,
        events: state.events,
      }),
    },
  ),
);
