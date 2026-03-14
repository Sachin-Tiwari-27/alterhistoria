import * as d3 from 'd3'
import type { PlayerNation, CountryBase } from '@/types'
import { COUNTRIES } from '@/data/countries'

export function getCountryFill(
  id: string,
  player: PlayerNation | null,
  _nations: Record<string, CountryBase>,
  occupations: Record<string, string>,
  theme: 'dark' | 'light'
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

  // If the actual clicked/rendered polygon ID is your own nation, it should ALWAYS look like 'Your Nation'
  // even if it's currently occupied by an enemy, so you can easily spot your homeland!
  if (id === player?.id || effectiveId === player?.id) {
    return player.customColor ?? player.color ?? (theme === 'dark' ? '#d4a843' : '#b48833')
  }

  // Calculate relation relative to the owner (occupier or self)
  if (player.friends.includes(effectiveId)) return theme === 'dark' ? '#166534' : '#22c55e'
  if (player.foes.includes(effectiveId))    return theme === 'dark' ? '#991b1b' : '#ef4444'
  
  // Neutral nations get a flat background to make the UI and map text readable
  return theme === 'dark' ? '#0a0a0a' : '#ffffff'
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
