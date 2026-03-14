import { useEffect, useRef } from 'react'

interface ConsequenceToastProps {
  narrative: string
  onDismiss: () => void
}

export function ConsequenceToast({ narrative, onDismiss }: ConsequenceToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, 9000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [narrative, onDismiss])

  const paragraphs = narrative.split('\n\n').filter(Boolean)

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-primary/30 rounded-sm shadow-2xl overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-cinzel text-[8px] tracking-widest text-primary uppercase mb-1.5">
              Consequences
            </div>
            <div className="text-[12px] text-foreground leading-relaxed space-y-1">
              {paragraphs.slice(0, 2).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors text-xs"
          >
            ✕
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-primary/20">
          <div className="h-full bg-primary origin-left animate-[shrink_9s_linear_forwards]" style={{ animation: 'shrink 9s linear forwards' }} />
        </div>
      </div>
    </div>
  )
}
