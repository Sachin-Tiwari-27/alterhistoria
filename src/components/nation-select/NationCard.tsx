import type { CountryBase } from '@/types'

interface NationCardProps {
  country: CountryBase
  selected?: boolean
  onClick: () => void
}

export function NationCard({ country, selected, onClick }: NationCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 border-b border-border/50 text-left transition-colors hover:bg-muted ${
        selected ? 'bg-primary/10 border-l-2 border-l-primary' : ''
      }`}
    >
      <span className="text-xl flex-shrink-0">{country.flag}</span>
      <div className="min-w-0">
        <div className="text-sm text-foreground truncate">{country.name}</div>
        <div className="text-[10px] text-muted-foreground font-cinzel tracking-wide">
          {country.region} · {country.capital}
        </div>
      </div>
      <div className="ml-auto text-right flex-shrink-0">
        <div className="text-[9px] font-mono-game text-muted-foreground">MIL {country.military}</div>
        <div className="text-[9px] font-mono-game text-muted-foreground">GDP {country.gdp}</div>
      </div>
    </button>
  )
}
