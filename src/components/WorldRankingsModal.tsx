import { useState, useMemo } from 'react'
import { X, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { useUIStore } from '@/store/uiStore'
import { COUNTRIES } from '@/data/countries'
import type { NationStats, Region } from '@/types'

type SortKey = keyof NationStats | 'total' | 'name'
type SortDir = 'asc' | 'desc'

const REGIONS: Region[] = ['Europe', 'Asia', 'Americas', 'Africa', 'Oceania']

const STAT_COLS: { key: keyof NationStats; label: string; short: string }[] = [
  { key: 'gdp',        label: 'GDP',        short: 'GDP'  },
  { key: 'military',   label: 'Military',   short: 'MIL'  },
  { key: 'stability',  label: 'Stability',  short: 'STB'  },
  { key: 'tech',       label: 'Technology', short: 'TECH' },
  { key: 'trade',      label: 'Trade',      short: 'TRD'  },
  { key: 'hdi',        label: 'HDI',        short: 'HDI'  },
  { key: 'freedom',    label: 'Freedom',    short: 'FRE'  },
  { key: 'democracy',  label: 'Democracy',  short: 'DEM'  },
]

function totalScore(n: NationStats) {
  return n.gdp + n.military + n.stability + n.tech + n.trade + n.hdi + n.freedom + n.democracy
}

export function WorldRankingsModal() {
  const player = useGameStore((s) => s.player)
  const nations = useGameStore((s) => s.nations)
  const toggleWorldRankings = useUIStore((s) => s.toggleWorldRankings)

  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState<Region | 'All'>('All')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const rows = useMemo(() => {
    const all = Object.values(COUNTRIES).map(c => {
      const live = nations[c.id]
      const isPlayer = c.id === player?.id
      return {
        ...c,
        name: isPlayer ? (player?.customName ?? player?.name ?? c.name) : c.name,
        flag: isPlayer ? (player?.customFlag ?? player?.flag ?? c.flag) : c.flag,
        // Use live nation stats if available
        ...(live ? {
          gdp: live.gdp,
          military: live.military,
          stability: live.stability,
          tech: live.tech,
          trade: live.trade,
          hdi: live.hdi,
          freedom: live.freedom,
          democracy: live.democracy,
          population: live.population
        } : {}),
      }
    })
    return all
      .filter(c => regionFilter === 'All' || c.region === regionFilter)
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        let av = sortKey === 'total' ? totalScore(a) : sortKey === 'name' ? 0 : (a[sortKey as keyof NationStats] as number)
        let bv = sortKey === 'total' ? totalScore(b) : sortKey === 'name' ? 0 : (b[sortKey as keyof NationStats] as number)
        if (sortKey === 'name') return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        return sortDir === 'asc' ? av - bv : bv - av
      })
  }, [nations, sortKey, sortDir, search, regionFilter])

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={10} className="opacity-40" />
    return sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />
  }

  const ColHeader = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      className="px-2 py-2 text-right cursor-pointer select-none hover:text-primary transition-colors whitespace-nowrap"
      onClick={() => handleSort(k)}
    >
      <span className="flex items-center justify-end gap-1">
        {label} <SortIcon k={k} />
      </span>
    </th>
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <div>
          <h2 className="font-cinzel text-lg tracking-widest text-foreground uppercase">World Rankings</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Sorted by {sortKey} · {rows.length} nations</p>
        </div>
        <button onClick={toggleWorldRankings} className="text-muted-foreground hover:text-foreground transition-colors p-2">
          <X size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border flex-shrink-0 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search nations…"
            className="bg-input border border-border rounded-sm pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors w-44"
          />
        </div>
        <div className="flex gap-1">
          {(['All', ...REGIONS] as (Region | 'All')[]).map(r => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={`font-cinzel text-[9px] tracking-widest px-2.5 py-1 rounded-sm border transition-all ${
                regionFilter === r ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
            >{r}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-2">
        <table className="w-full text-[11px] border-collapse">
          <thead className="sticky top-0 bg-background z-10">
            <tr className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase border-b border-border">
              <th className="px-2 py-2 text-left w-8">#</th>
              <th className="px-2 py-2 text-left cursor-pointer select-none hover:text-primary" onClick={() => handleSort('name')}>
                <span className="flex items-center gap-1">Nation <SortIcon k="name" /></span>
              </th>
              <th className="px-2 py-2 text-left">Region</th>
              {STAT_COLS.map(c => <ColHeader key={c.key} k={c.key} label={c.short} />)}
              <ColHeader k="total" label="TOTAL" />
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => {
              const isPlayer = c.id === player?.id
              return (
                <tr
                  key={c.id}
                  className={`border-b border-border/40 transition-colors ${
                    isPlayer
                      ? 'bg-primary/10 font-semibold'
                      : 'hover:bg-muted/30'
                  }`}
                >
                  <td className="px-2 py-1.5 text-muted-foreground font-mono-game">{i + 1}</td>
                  <td className="px-2 py-1.5">
                    <span className="mr-1.5">{c.flag}</span>
                    <span className={isPlayer ? 'text-primary' : 'text-foreground'}>{c.name}</span>
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground">{c.region}</td>
                  {STAT_COLS.map(col => (
                    <td key={col.key} className={`px-2 py-1.5 text-right font-mono-game ${sortKey === col.key ? 'text-primary' : 'text-foreground'}`}>
                      {c[col.key]}
                    </td>
                  ))}
                  <td className={`px-2 py-1.5 text-right font-mono-game font-bold ${sortKey === 'total' ? 'text-primary' : 'text-foreground'}`}>
                    {totalScore(c)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
