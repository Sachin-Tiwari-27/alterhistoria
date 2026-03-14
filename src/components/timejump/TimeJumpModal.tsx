import { X, SkipForward, ArrowLeft, Zap } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { useUIStore } from '@/store/uiStore'
import { uid } from '@/lib/utils'

export function TimeJumpModal() {
  const year = useGameStore((s) => s.year)
  const addEvent = useGameStore((s) => s.addEvent)

  const modalYear = useUIStore((s) => s.timeJumpModalYear)
  const modalResult = useUIStore((s) => s.timeJumpModalResult)
  const closeTimeJumpModal = useUIStore((s) => s.closeTimeJumpModal)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _uid = uid // prevent unused warn

  const jumpYears = modalYear - year

  // Parse narrative into paragraphs
  const paragraphs = modalResult
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean)

  const handleContinue = () => {
    // Seed a few generated events into the event feed and close
    addEvent(`Your alternate timeline reaches ${modalYear}. History has been irrevocably changed.`, 'world')
    closeTimeJumpModal()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Year banner */}
        <div className="relative px-6 pt-8 pb-6 text-center border-b border-border flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="font-mono-game text-7xl text-primary font-bold tracking-widest leading-none">
            {modalYear}
          </div>
          <div className="font-cinzel text-xs tracking-widest text-muted-foreground uppercase mt-2">
            Alternate Timeline · {jumpYears} years diverged
          </div>
          <button
            onClick={closeTimeJumpModal}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={13} className="text-primary" />
            <span className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase">
              AI Simulation — Alternate History
            </span>
          </div>

          {paragraphs.map((para, i) => (
            <p key={i} className="text-[13px] text-foreground leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex gap-3 p-5 border-t border-border flex-shrink-0">
          <button
            onClick={closeTimeJumpModal}
            className="flex-1 flex items-center justify-center gap-2 border border-border text-muted-foreground hover:border-primary hover:text-foreground font-cinzel text-xs tracking-widest py-3 rounded-sm transition-colors"
          >
            <ArrowLeft size={13} />
            Stay in {year}
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-cinzel text-xs tracking-widest py-3 rounded-sm hover:opacity-90 transition-opacity"
          >
            <SkipForward size={13} />
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
