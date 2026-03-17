import * as d3 from 'd3'
import type { PlayerNation, CountryBase } from '@/types'
import { COUNTRIES } from '@/data/countries'

export type MapMode = 'political' | 'territorial'

export function getCountryFill(
  id: string,
  player: PlayerNation | null,
  nations: Record<string, CountryBase>,
  occupations: Record<string, string>,
  theme: 'dark' | 'light',
  mode: MapMode = 'political'
): string {
  // If no player has been selected, use base colors but handle 1920s occupations
  const occupierId = occupations[id]
  let effectiveId = occupierId ?? id

  if (!player) {
    const c = COUNTRIES[effectiveId]
    if (!c) return theme === 'dark' ? '#121212' : '#ffffff'
    
    // Adapt colors for light/dark to maintain contrast and readable background
    const d3c = d3.hsl(c.color)
    if (theme === 'dark') {
      d3c.l = Math.max(0.1, d3c.l * 0.4) // Darken base colors so they don't blind the user on black
      d3c.s = Math.max(0.1, d3c.s * 0.8) // Desaturate slightly
    } else {
      d3c.l = Math.min(0.95, d3c.l + (1 - d3c.l) * 0.5) // Lighten base colors heavily for off-white
    }
    return d3c.formatHex()
  }

  // 1. Homelands (Player)
  const isPlayerControlled = id === player?.id || effectiveId === player?.id
  if (isPlayerControlled) {
    return player.customColor ?? player.color ?? (theme === 'dark' ? '#d4a843' : '#b48833')
  }

  // 2. Occupied (Show occupier's color in Political mode, or gray in Territorial)
  const isOccupied = occupierId && occupierId !== id
  if (isOccupied) {
    if (mode === 'political') {
      const occupier = nations[occupierId] ?? COUNTRIES[occupierId]
      if (occupier) {
        // If occupier is player, use player gold
        if (occupierId === player?.id) return player.customColor ?? player.color ?? (theme === 'dark' ? '#d4a843' : '#b48833')
        // If occupier is friend, use green
        if (player?.friends.includes(occupierId)) return theme === 'dark' ? '#064e3b' : '#34d399'
        // If occupier is foe, use red
        if (player?.foes.includes(occupierId)) return theme === 'dark' ? '#7f1d1d' : '#f87171'
        
        // General occupier (grayish version of their color)
        const d3c = d3.hsl(occupier.color)
        d3c.s *= 0.4
        d3c.l = theme === 'dark' ? 0.2 : 0.8
        return d3c.formatHex()
      }
    }
    return theme === 'dark' ? '#27272a' : '#d4d4d8' // Subtle gray for occupied in territorial mode
  }

  // 3. Relations (Political mode only)
  if (mode === 'political' && player) {
    if (player.friends.includes(effectiveId)) return theme === 'dark' ? '#166534' : '#22c55e'
    if (player.foes.includes(effectiveId))    return theme === 'dark' ? '#991b1b' : '#ef4444'
  }
  
  // 4. Neutral / Base
  const c = nations[effectiveId] ?? COUNTRIES[effectiveId]
  if (!c) return theme === 'dark' ? '#0a0a0a' : '#f5f5f5'
  
  const d3c = d3.hsl(c.color)
  if (theme === 'dark') {
    d3c.l = 0.12
    d3c.s *= 0.4
  } else {
    // Parchment / Paper effect for light mode
    d3c.l = 0.92
    d3c.s *= 0.2
  }
  return d3c.formatHex()
}

export const OCEAN_COLOR: Record<'dark' | 'light', string> = {
  dark:  '#071828',
  light: '#a8c8e8',
}

export const BORDER_COLOR: Record<'dark' | 'light', string> = {
  dark:  '#0d2035',
  light: '#8a8070',
}

export const GRATICULE_COLOR: Record<'dark' | 'light', string> = {
  dark:  'rgba(255,255,255,0.04)',
  light: 'rgba(0,0,0,0.06)',
}
