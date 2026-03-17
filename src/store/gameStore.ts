import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { uid, clamp } from '@/lib/utils'
import type { PlayerNation, CountryBase, TurnAction, WorldEvent, TurnResult, NationStats, ActionRecord } from '@/types'
import { COUNTRIES } from '@/data/countries'

export const HISTORICAL_OCCUPATIONS_1920: Record<string, string> = {
  // British Empire & Dominions
  '356': '826', '586': '826', '050': '826', '036': '826', '124': '826', '554': '826', '710': '826', '818': '826', '566': '826', '400': '826', '368': '826', '376': '826', '887': '826',
  // French Empire
  '012': '250', '116': '250', '704': '250', '504': '250', '788': '250', '422': '250', '760': '250',
  // Japanese Empire
  '410': '392',
  // US Territories
  '608': '840',
  // Italian Colonies
  '434': '380',
  // Soviet Union absorbing
  '804': '643',
  // Dutch Empire
  '360': '528'
}

interface GameState {
  year: number
  quarter: number
  turn: number
  divergence: number
  apiKey: string | null
  player: PlayerNation | null
  nations: Record<string, CountryBase>
  actions: TurnAction[]
  actionHistory: ActionRecord[]
  events: WorldEvent[]
  ticker: string
  draftAction: string
  occupations: Record<string, string>

  setApiKey: (key: string) => void
  startGame: (nationId: string) => void
  applyTurnResult: (result: TurnResult, action: string) => void
  addEvent: (text: string, type: WorldEvent['type']) => void
  updatePlayerNation: (patch: Partial<PlayerNation>) => void
  setTicker: (text: string) => void
  setDraftAction: (text: string) => void
  getPlayerDisplayName: () => string
  getPlayerPolityLabel: () => string
  resetGame: () => void
  jumpToYear: (targetYear: number, seedEvents: Array<{ text: string; type: WorldEvent['type'] }>) => void
}

const STAT_KEYS: (keyof NationStats)[] = [
  'gdp', 'hdi', 'freedom', 'democracy', 'population',
  'military', 'trade', 'stability', 'tech', 'treasury'
]

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
      actionHistory: [],
      events: [],
      ticker: '◆ The Great War has ended. The League of Nations convenes. A new century begins. What will you make of it?',
      draftAction: '',
      occupations: { ...HISTORICAL_OCCUPATIONS_1920 },

      setApiKey: (key) => set(s => { s.apiKey = key }),

      startGame: (nationId) => set(s => {
        const base = COUNTRIES[nationId]
        if (!base) return
        s.player = { ...JSON.parse(JSON.stringify(base)), lore: [base.context] }
        s.nations = JSON.parse(JSON.stringify(COUNTRIES))
        s.year = 1920
        s.quarter = 1
        s.turn = 1
        s.divergence = 0
        s.actions = []
        s.actionHistory = []
        s.draftAction = ''
        s.occupations = { ...HISTORICAL_OCCUPATIONS_1920 }
        s.events = [{
          id: uid(),
          year: 1920,
          quarter: 1,
          text: `You assume leadership of ${base.name}. ${base.context}`,
          type: 'world'
        }]
        s.ticker = `◆ 1920 — ${base.name} begins a new chapter. ${base.context.split('.')[0]}.`
      }),

      applyTurnResult: (result, action) => set(s => {
        if (!s.player) return

        // Apply stat changes with HDI scaling
        const hdiEff = clamp(s.player.hdi / 50, 0.5, 2.0)

        STAT_KEYS.forEach(k => {
          let delta = (result.statChanges as Record<string, number>)[k] || 0
          
          // Budget handling: if AI returns a budgetCost, deduct it
          if (k === 'treasury' && result.budgetCost) {
            delta -= result.budgetCost
          }

          if (delta !== 0) {
            if (k === 'tech' || k === 'gdp') delta *= hdiEff
            const max = k === 'population' ? 5000 : k === 'treasury' ? 99999 : 100
            const p = s.player as any
            p[k] = clamp((p[k] || 0) + delta, 0, max)
          }
        })

        // Organic quarterly revenue for player
        const revenue = Math.floor((s.player.gdp * 0.05) + (s.player.trade * 0.03))
        s.player.treasury += revenue

        // Stat Transfers (Colonial Independence / Partition)
        if (result.transfers) {
          result.transfers.forEach(t => {
            const from = s.nations[t.fromId]
            const to = s.nations[t.toId]
            if (from && to) {
              STAT_KEYS.forEach(k => {
                const val = (t.stats as Record<string, number>)[k]
                if (val) {
                  const fromAny = from as any
                  const toAny = to as any
                  fromAny[k] = clamp(fromAny[k] - val, 0, 99999)
                  toAny[k] = clamp(toAny[k] + val, 0, 99999)
                }
              })
            }
          })
        }

        // Sync player to global nations for rankings
        if (s.nations[s.player.id]) {
          Object.assign(s.nations[s.player.id], s.player)
        }

        // Global Growth Engine + AI Nation Drift
        Object.keys(s.nations).forEach(id => {
          const n = s.nations[id]
          if (!n) return

          // 1. Organic Quarterly Growth (all nations)
          if (n.stability > 30) {
            n.gdp = clamp(n.gdp * (1 + (Math.random() * 0.008)), 1, 1000)
            n.tech = clamp(n.tech + (Math.random() * 0.2), 0, 100)
            n.treasury += Math.floor((n.gdp * 0.05) + (n.trade * 0.03))
          } else {
            // Instability penalty
            n.gdp = clamp(n.gdp * (0.98 + (Math.random() * 0.01)), 1, 1000)
            n.stability = clamp(n.stability - (Math.random() * 2), 0, 100)
          }

          // 2. Drift (random events/internal shifts every 2 turns)
          if (s.turn % 2 === 0 && id !== s.player!.id) {
            const keys = [...STAT_KEYS].filter(k => k !== 'treasury').sort(() => Math.random() - 0.5).slice(0, 2)
            keys.forEach(k => {
              const drift = (Math.random() * 2 - 1)
              const nAny = n as any
              nAny[k] = clamp(nAny[k] + drift, 5, 100)
            })
          }
        })

        // Relations
        const ensureId = (val: any) => typeof val === 'string' ? val : (val?.id ?? null)

        result.newFriends.forEach(rawId => {
          const id = ensureId(rawId)
          if (id && !s.player!.friends.includes(id)) s.player!.friends.push(id)
          if (id) s.player!.foes = s.player!.foes.filter(f => f !== id)
        })
        result.newFoes.forEach(rawId => {
          const id = ensureId(rawId)
          if (id && !s.player!.foes.includes(id)) s.player!.foes.push(id)
          if (id) s.player!.friends = s.player!.friends.filter(f => f !== id)
        })
        result.removeFoes.forEach(rawId => {
          const id = ensureId(rawId)
          if (id) s.player!.foes = s.player!.foes.filter(f => f !== id)
        })

        // Territorial changes
        if (result.occupations) {
          Object.entries(result.occupations).forEach(([targetId, occupierId]) => {
            s.occupations[targetId] = occupierId
          })
        }
        if (result.liberations) {
          result.liberations.forEach(targetId => {
            delete s.occupations[targetId]
          })
        }

        // Lore
        if (result.narrative) s.player!.lore.push(result.narrative)

        s.divergence = clamp(s.divergence + result.divergenceDelta, 0, 9999)
        if (result.ticker) s.ticker = `◆ ${s.year}: ${result.ticker}`

        // Record action + consequences in history
        const deltaMap: Partial<NationStats> = {}
        STAT_KEYS.forEach(k => {
          const delta = (result.statChanges as Record<string, number>)[k]
          if (delta !== undefined && delta !== 0) deltaMap[k] = delta
        })
        s.actionHistory.unshift({
          id: uid(),
          year: s.year,
          quarter: s.quarter,
          action,
          narrative: result.narrative ?? '',
          events: result.worldEvents.map(e => e.text),
          statDeltas: deltaMap,
        })
        s.actions.push({ year: s.year, quarter: s.quarter, action })

        // Add world events
        result.worldEvents.forEach(e => {
          s.events.unshift({ id: uid(), year: s.year, quarter: s.quarter, text: e.text, type: e.type })
        })

        // Advance time
        s.quarter += 1
        if (s.quarter > 4) { s.quarter = 1; s.year += 1 }
        s.turn += 1
      }),

      addEvent: (text, type) => set(s => {
        s.events.unshift({ id: uid(), year: s.year, quarter: s.quarter, text, type })
      }),

      updatePlayerNation: (patch) => set(s => {
        if (!s.player) return
        Object.assign(s.player, patch)
      }),

      setTicker: (text) => set(s => { s.ticker = text }),
      
      setDraftAction: (text) => set(s => { s.draftAction = text }),

      getPlayerDisplayName: () => {
        const p = get().player
        return p?.customName ?? p?.name ?? '—'
      },

      getPlayerPolityLabel: () => {
        const p = get().player
        const polity = p?.customPolity ?? p?.polity ?? 'republic'
        return polity.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      },

      resetGame: () => set(s => {
        s.player = null
        s.nations = JSON.parse(JSON.stringify(COUNTRIES))
        s.year = 1920; s.quarter = 1; s.turn = 1; s.divergence = 0
        s.actions = []; s.actionHistory = []; s.events = []; s.draftAction = ''
        s.occupations = { ...HISTORICAL_OCCUPATIONS_1920 }
      }),

      jumpToYear: (targetYear: number, seedEvents: Array<{ text: string; type: WorldEvent['type'] }>) => set(s => {
        s.year = targetYear
        s.quarter = 1
        s.turn += 1
        seedEvents.forEach((e: { text: string; type: WorldEvent['type'] }) => {
          s.events.unshift({
            id: uid(),
            year: targetYear,
            quarter: 1,
            text: e.text,
            type: e.type,
            source: 'alt'
          })
        })
        s.ticker = `◆ TIME JUMPED TO ${targetYear}. The timeline continues...`
      }),
    })),
    {
      name: 'alterhistoria-v2',
      partialize: (s) => ({
        year: s.year, quarter: s.quarter, turn: s.turn,
        divergence: s.divergence, apiKey: s.apiKey,
        player: s.player, nations: s.nations,
        actions: s.actions, actionHistory: s.actionHistory,
        events: s.events, ticker: s.ticker,
        draftAction: s.draftAction, occupations: s.occupations
      }),
    }
  )
)
