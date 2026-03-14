import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useUIStore } from '@/store/uiStore'
import { executeTurn } from '@/lib/ai'

export function ActionBox() {
  const [action, setAction] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const player = useGameStore((s) => s.player)
  const year = useGameStore((s) => s.year)
  const quarter = useGameStore((s) => s.quarter)
  const applyTurnResult = useGameStore((s) => s.applyTurnResult)
  const setDraftAction = useGameStore((s) => s.setDraftAction)
  const getPlayerDisplayName = useGameStore((s) => s.getPlayerDisplayName)
  const setTab = useUIStore((s) => s.setTab)

  const handleExecute = async () => {
    if (!player) return
    if (!action.trim()) { setError('Enter your decree for this turn.'); return }
    setError('')
    setLoading(true)
    try {
      const result = await executeTurn(action)
      applyTurnResult(result, action)
      setAction('')
      setTab('events')
      setTimeout(() => setTab('advisor'), 200)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI call failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAdvise = () => {
    if (action.trim()) {
      setDraftAction(action.trim())
      useUIStore.getState().setTab('advisor')
    }
  }

  if (!player) return null

  return (
    <div className="flex-shrink-0 bg-card border-t border-border p-3">
      <label className="block font-cinzel text-[8px] tracking-[0.2em] text-muted-foreground uppercase mb-2">
        ◆ {getPlayerDisplayName()} — {year} Q{quarter} — Your decree
      </label>
      <div className="flex gap-2">
        <textarea
          value={action}
          onChange={(e) => setAction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) handleExecute()
          }}
          disabled={loading}
          placeholder={`Describe your strategy and actions for this turn… e.g. "I declare independence from colonial rule, establish a constitutional assembly, and open trade negotiations with the United States…"`}
          className="flex-1 bg-input border border-border rounded-sm px-3 py-2 text-sm font-garamond text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none h-16 leading-relaxed disabled:opacity-60"
        />
        <div className="flex flex-col gap-1.5">
          <button
            onClick={handleExecute}
            disabled={loading || !action.trim()}
            className="bg-primary text-primary-foreground font-cinzel text-[9px] tracking-widest px-4 py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex-1"
          >
            {loading ? '⟳ Processing…' : '▶ EXECUTE'}
          </button>
          <button
            onClick={handleAdvise}
            disabled={loading}
            className="border border-border text-muted-foreground font-cinzel text-[9px] tracking-widest px-4 py-2 rounded-sm hover:border-primary hover:text-primary transition-colors whitespace-nowrap flex-1"
          >
            ⚡ ADVISE
          </button>
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1.5">{error}</p>
      )}
      <p className="text-[9px] text-muted-foreground mt-1">Ctrl+Enter to execute</p>
    </div>
  )
}
