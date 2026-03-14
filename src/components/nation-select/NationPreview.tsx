import type { CountryBase } from '@/types'

interface NationPreviewProps {
  country: CountryBase
  onConfirm: () => void
  onCancel: () => void
}

const STAT_ROWS: [string, keyof CountryBase][] = [
  ['GDP',        'gdp'],
  ['Military',   'military'],
  ['Stability',  'stability'],
  ['Technology', 'tech'],
  ['HDI',        'hdi'],
  ['Freedom',    'freedom'],
  ['Democracy',  'democracy'],
  ['Trade',      'trade'],
]

export function NationPreview({ country, onConfirm, onCancel }: NationPreviewProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <span className="text-6xl">{country.flag}</span>
        <div>
          <h2 className="font-cinzel text-3xl text-foreground font-semibold mb-1">{country.name}</h2>
          <div className="flex gap-3 text-xs text-muted-foreground font-cinzel tracking-wider">
            <span>{country.region}</span>
            <span>·</span>
            <span>{country.capital}</span>
            <span>·</span>
            <span className="capitalize">{country.polity.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      {/* Context */}
      <div className="bg-muted/30 border border-border rounded-sm p-4 mb-6">
        <p className="font-cinzel text-[9px] tracking-widest text-primary uppercase mb-2">
          Historical Context · 1920
        </p>
        <p className="text-sm text-foreground leading-relaxed italic">{country.context}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {STAT_ROWS.map(([label, key]) => (
          <div key={label} className="bg-muted/20 border border-border rounded-sm p-3 text-center">
            <div className="font-mono-game text-lg text-primary font-bold">
              {country[key] as number}
            </div>
            <div className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase mt-0.5">
              {label}
            </div>
          </div>
        ))}
        <div className="bg-muted/20 border border-border rounded-sm p-3 text-center">
          <div className="font-mono-game text-lg text-primary font-bold">{country.population}M</div>
          <div className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase mt-0.5">
            Population
          </div>
        </div>
      </div>

      {/* Relations */}
      {(country.friends.length > 0 || country.foes.length > 0) && (
        <div className="mb-6 space-y-1">
          {country.friends.length > 0 && (
            <div className="text-xs">
              <span className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase">Allies: </span>
              <span className="text-green-500">{country.friends.join(', ')}</span>
            </div>
          )}
          {country.foes.length > 0 && (
            <div className="text-xs">
              <span className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase">Rivals: </span>
              <span className="text-red-500">{country.foes.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground italic mb-6">
        ✎ You can rename this nation, change its polity, flag, and identity after selecting.
      </p>

      {/* Actions */}
      <div className="mt-auto flex gap-3">
        <button
          onClick={onConfirm}
          className="flex-1 bg-primary text-primary-foreground font-cinzel tracking-widest text-sm py-4 rounded-sm hover:opacity-90 transition-opacity"
        >
          ▶ LEAD {country.name.toUpperCase()}
        </button>
        <button
          onClick={onCancel}
          className="px-6 border border-border text-muted-foreground font-cinzel text-xs tracking-widest rounded-sm hover:border-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
