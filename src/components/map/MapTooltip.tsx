import type { CountryBase } from '@/types'

interface MapTooltipProps {
  x: number
  y: number
  country: CountryBase
}

export function MapTooltip({ x, y, country }: MapTooltipProps) {
  return (
    <div
      className="fixed z-40 pointer-events-none bg-card border border-border rounded-sm shadow-xl p-3 min-w-[200px] max-w-[260px]"
      style={{ left: x + 14, top: y - 20 }}
    >
      <div className="font-cinzel text-primary text-xs mb-2">
        {country.flag} {country.name}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] mb-2">
        {(['gdp', 'military', 'stability', 'tech'] as const).map((k) => (
          <div key={k} className="flex justify-between">
            <span className="text-muted-foreground capitalize">{k}</span>
            <span className="font-mono-game text-foreground">{country[k]}</span>
          </div>
        ))}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pop.</span>
          <span className="font-mono-game text-foreground">{country.population}M</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Trade</span>
          <span className="font-mono-game text-foreground">{country.trade}</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border pt-2 italic">
        {country.context.slice(0, 120)}…
      </p>
    </div>
  )
}
