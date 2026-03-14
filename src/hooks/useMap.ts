import { useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useUIStore } from '@/store/uiStore'
import { COUNTRIES } from '@/data/countries'

export function useMapColors() {
  const player = useGameStore((s) => s.player)
  const nations = useGameStore((s) => s.nations)
  const theme = useUIStore((s) => s.theme)

  const getCountryFill = useCallback(
    (id: string): string => {
      if (!player) {
        const c = COUNTRIES[id]
        return c?.color ?? (theme === 'dark' ? '#1e3a50' : '#c8c0a0')
      }
      if (id === player.id) return player.customColor ?? player.color ?? '#d4a843'
      if (player.friends.includes(id)) return theme === 'dark' ? '#1a5030' : '#4a9060'
      if (player.foes.includes(id)) return theme === 'dark' ? '#5a1515' : '#9a3535'
      const nation = nations[id] ?? COUNTRIES[id]
      return nation?.color ?? (theme === 'dark' ? '#1e3a50' : '#b0a888')
    },
    [player, nations, theme]
  )

  return { getCountryFill }
}

export function useMapInteraction() {
  const player = useGameStore((s) => s.player)
  const setTab = useUIStore((s) => s.setTab)
  const setShowNationSelect = useUIStore((s) => s.setShowNationSelect)

  const handleCountryClick = useCallback(
    (id: string, addToChannel: (id: string) => void) => {
      if (!player) {
        setShowNationSelect(true)
        return
      }
      if (id === player.id) {
        setTab('advisor')
        return
      }
      addToChannel(id)
      setTab('diplomacy')
    },
    [player, setTab, setShowNationSelect]
  )

  return { handleCountryClick }
}
