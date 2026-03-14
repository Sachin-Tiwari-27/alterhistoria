import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { useUIStore } from '@/store/uiStore'
import { useDiploStore } from '@/store/diploStore'
import { getAllCountries, searchCountries } from '@/data/countries'
import type { CountryBase, Region } from '@/types'

const REGIONS: (Region | 'All')[] = ['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania']

export function NationSelectOverlay() {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<Region | 'All'>('All')
  const [preview, setPreview] = useState<CountryBase | null>(null)

  const startGame = useGameStore((s) => s.startGame)
  const setShowNationSelect = useUIStore((s) => s.setShowNationSelect)
  const clearHistory = useDiploStore((s) => s.clearHistory)
  const clearChannel = useDiploStore((s) => s.clearChannel)

  const all = getAllCountries()

  const filtered = (query.length >= 2 ? searchCountries(query) : all).filter(
    (c) => region === 'All' || c.region === region
  )

  const confirm = () => {
    if (!preview) return
    startGame(preview.id)
    clearHistory()
    clearChannel()
    setShowNationSelect(false)
  }

  // Keyboard: Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowNationSelect(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setShowNationSelect])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border flex-shrink-0">
        <div>
          <h1 className="font-cinzel text-2xl text-primary tracking-[0.3em] font-semibold">ALTER HISTORIA</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-cinzel tracking-widest text-xs uppercase">
            Choose the nation you will lead — 1920
          </p>
        </div>
        <button
          onClick={() => setShowNationSelect(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left: list */}
        <div className="flex flex-col w-[340px] flex-shrink-0 border-r border-border overflow-hidden">
          {/* Search + filter */}
          <div className="p-4 space-y-2 border-b border-border flex-shrink-0">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any country…"
              className="w-full bg-input border border-border rounded-sm px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
            <div className="flex flex-wrap gap-1">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`font-cinzel text-[8px] tracking-widest uppercase px-2.5 py-1 rounded-sm border transition-colors ${
                    region === r
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Nation list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setPreview(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-border/50 text-left transition-colors hover:bg-muted ${
                  preview?.id === c.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                }`}
              >
                <span className="text-xl flex-shrink-0">{c.flag}</span>
                <div className="min-w-0">
                  <div className="text-sm text-foreground truncate">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground font-cinzel tracking-wide">
                    {c.region} · {c.capital}
                  </div>
                </div>
                <div className="ml-auto text-right flex-shrink-0">
                  <div className="text-[9px] font-mono-game text-muted-foreground">
                    MIL {c.military}
                  </div>
                  <div className="text-[9px] font-mono-game text-muted-foreground">
                    GDP {c.gdp}
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground italic text-center p-6">No nations found</p>
            )}
          </div>
        </div>

        {/* Right: preview */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col">
          {preview ? (
            <>
              {/* Nation header */}
              <div className="flex items-start gap-4 mb-6">
                <span className="text-6xl">{preview.flag}</span>
                <div>
                  <h2 className="font-cinzel text-3xl text-foreground font-semibold mb-1">{preview.name}</h2>
                  <div className="flex gap-3 text-xs text-muted-foreground font-cinzel tracking-wider">
                    <span>{preview.region}</span>
                    <span>·</span>
                    <span>{preview.capital}</span>
                    <span>·</span>
                    <span className="capitalize">{preview.polity.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Context */}
              <div className="bg-muted/30 border border-border rounded-sm p-4 mb-6">
                <p className="font-cinzel text-[9px] tracking-widest text-primary uppercase mb-2">Historical Context · 1920</p>
                <p className="text-sm text-foreground leading-relaxed italic">{preview.context}</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(
                  [
                    ['GDP',        preview.gdp],
                    ['Military',   preview.military],
                    ['Stability',  preview.stability],
                    ['Technology', preview.tech],
                    ['HDI',        preview.hdi],
                    ['Freedom',    preview.freedom],
                    ['Democracy',  preview.democracy],
                    ['Trade',      preview.trade],
                    ['Population', `${preview.population}M`],
                  ] as [string, number | string][]
                ).map(([label, value]) => (
                  <div key={label} className="bg-muted/20 border border-border rounded-sm p-3 text-center">
                    <div className="font-mono-game text-lg text-primary font-bold">{value}</div>
                    <div className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Friends / foes */}
              {(preview.friends.length > 0 || preview.foes.length > 0) && (
                <div className="mb-6 space-y-2">
                  {preview.friends.length > 0 && (
                    <div>
                      <span className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase">Allies: </span>
                      <span className="text-xs text-green-500">{preview.friends.join(', ')}</span>
                    </div>
                  )}
                  {preview.foes.length > 0 && (
                    <div>
                      <span className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase">Rivals: </span>
                      <span className="text-xs text-red-500">{preview.foes.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-auto flex gap-3">
                <button
                  onClick={confirm}
                  className="flex-1 bg-primary text-primary-foreground font-cinzel tracking-widest text-sm py-4 rounded-sm hover:opacity-90 transition-opacity"
                >
                  ▶ LEAD {preview.name.toUpperCase()}
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="px-6 border border-border text-muted-foreground font-cinzel text-xs tracking-widest rounded-sm hover:border-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <p className="text-5xl">🌍</p>
                <p className="font-cinzel text-muted-foreground tracking-widest text-sm">
                  Select a nation to see its 1920 profile
                </p>
                <p className="text-xs text-muted-foreground italic max-w-xs">
                  You can rename it, change its polity, and reshape its identity after selecting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
