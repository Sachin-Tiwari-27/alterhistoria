import { X, Clock } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { useUIStore } from '@/store/uiStore'

const STAT_LABELS: Record<string, string> = {
  gdp: 'GDP', hdi: 'HDI', freedom: 'Freedom', democracy: 'Democracy',
  population: 'Pop', military: 'Military', trade: 'Trade', stability: 'Stability', tech: 'Tech',
}

export function TimelineDrawer() {
  const actionHistory = useGameStore((s) => s.actionHistory)
  const player = useGameStore((s) => s.player)
  const toggleTimeline = useUIStore((s) => s.toggleTimeline)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/10" onClick={toggleTimeline} />

      {/* Drawer */}
      <div className="relative w-full max-w-lg h-full bg-card border-l border-border flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span className="font-cinzel text-sm tracking-widest text-foreground uppercase">Decree History</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground font-cinzel tracking-widest">
              {actionHistory.length} DECREES
            </span>
            <button onClick={toggleTimeline} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {actionHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[12px] text-muted-foreground italic text-center">
                No decrees issued yet. Start playing to build your alternate history.
              </p>
            </div>
          ) : (
            actionHistory.map((record) => (
              <div key={record.id} className="border border-border rounded-sm overflow-hidden">
                {/* Turn header */}
                <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border">
                  <span className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase">
                    {record.year} Q{record.quarter}
                  </span>
                  {/* Stat deltas */}
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(record.statDeltas).map(([k, v]) => v !== 0 && (
                      <span
                        key={k}
                        className={`text-[9px] font-mono-game px-1.5 py-0.5 rounded-sm ${
                          (v as number) > 0
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}
                      >
                        {STAT_LABELS[k] ?? k} {(v as number) > 0 ? '+' : ''}{v}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Player decree */}
                <div className="px-3 py-2 bg-primary/5 border-b border-border">
                  <div className="flex items-start gap-2">
                    <span className="text-[8px] font-cinzel tracking-widest text-primary uppercase pt-0.5 whitespace-nowrap">
                      {player?.customFlag ?? player?.flag} Decree
                    </span>
                    <p className="text-[11px] text-foreground leading-relaxed">{record.action}</p>
                  </div>
                </div>

                {/* AI Narrative */}
                {record.narrative && (
                  <div className="px-3 py-2 border-b border-border">
                    <div className="text-[8px] font-cinzel tracking-widest text-muted-foreground uppercase mb-1">Consequences</div>
                    <p className="text-[11px] text-foreground leading-relaxed">{record.narrative}</p>
                  </div>
                )}

                {/* World events */}
                {record.events.length > 0 && (
                  <div className="px-3 py-2 bg-muted/30">
                    <div className="text-[8px] font-cinzel tracking-widest text-muted-foreground uppercase mb-1.5">World events triggered</div>
                    <ul className="space-y-1">
                      {record.events.map((e, i) => (
                        <li key={i} className="text-[10px] text-muted-foreground flex gap-1.5">
                          <span className="text-primary mt-0.5">◆</span>
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
