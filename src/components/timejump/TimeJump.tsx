import { useGameStore } from '@/store/gameStore'
import { useUIStore } from '@/store/uiStore'
import { callAI, buildTimeJumpSystemPrompt } from '@/lib/ai'
import { getMilestonesForRange } from '@/data/historicalEvents'

const DECADE_PRESETS = [1930, 1940, 1945, 1950, 1960, 1970, 1980]

export function TimeJump() {
  const player = useGameStore((s) => s.player)
  const year = useGameStore((s) => s.year)

  const targetYear    = useUIStore((s) => s.timeJumpYear)
  const loading       = useUIStore((s) => s.timeJumpLoading)
  const error         = useUIStore((s) => s.timeJumpError)
  const setTargetYear = useUIStore((s) => s.setTimeJumpYear)
  const setLoading    = useUIStore((s) => s.setTimeJumpLoading)
  const setError      = useUIStore((s) => s.setTimeJumpError)
  const openModal     = useUIStore((s) => s.openTimeJumpModal)

  const minYear = Math.min(year + 1, 1979)
  const clampedTarget = Math.max(minYear, Math.min(targetYear, 1980))

  const milestonePreview = getMilestonesForRange(year, Math.min(clampedTarget, year + 5))
    .split(';')[0]
    .replace(/^\d{4}-?\d*:?\s*/, '')
    .slice(0, 100)

  const simulate = async () => {
    if (!player || loading) return
    setError('')
    setLoading(true)
    setResult('')
    try {
      const milestones = getMilestonesForRange(year, clampedTarget)
      const system = buildTimeJumpSystemPrompt(clampedTarget, milestones)
      const reply = await callAI(
        system,
        [{ role: 'user', content: `Simulate the alternate timeline narrative from ${year} to ${clampedTarget}.` }],
        1400
      )
      openModal(clampedTarget, reply)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed. Check your API key or try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!player) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-xs text-muted-foreground italic text-center">
          Select a nation to simulate alternate futures.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Top controls — always visible */}
      <div className="flex-shrink-0 p-4 space-y-4 border-b border-border">
        <div>
          <p className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase mb-0.5">
            Simulate Alternate Future
          </p>
          <p className="text-[11px] text-muted-foreground">
            Where does your alternate timeline lead?
          </p>
        </div>

        {/* Year display */}
        <div className="text-center">
          <div className="font-mono-game text-5xl text-primary font-bold tracking-widest leading-none">
            {clampedTarget}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {clampedTarget - year} years from now
          </div>
        </div>

        {/* Decade quick-pick */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {DECADE_PRESETS.filter(y => y > year).map((y) => (
            <button
              key={y}
              onClick={() => setTargetYear(y)}
              className={`font-cinzel text-[9px] tracking-widest px-2.5 py-1 rounded-sm border transition-all ${
                clampedTarget === y
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
            >
              {y}
            </button>
          ))}
        </div>

        {/* Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min={minYear}
            max={1980}
            step={1}
            value={clampedTarget}
            onChange={(e) => setTargetYear(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono-game text-muted-foreground">
            <span>{minYear}</span>
            <span>1950</span>
            <span>1980</span>
          </div>
        </div>

        {/* Milestone hint */}
        {milestonePreview && (
          <div className="text-[9px] text-muted-foreground bg-muted border border-border rounded-sm p-2 leading-relaxed">
            <span className="font-cinzel tracking-wide uppercase text-primary/70">Real history near {clampedTarget}: </span>
            {milestonePreview}…
          </div>
        )}

        <button
          onClick={simulate}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground font-cinzel text-xs tracking-widest py-3 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin">⟳</span>
              Simulating {clampedTarget}…
            </>
          ) : (
            `⏩ JUMP TO ${clampedTarget}`
          )}
        </button>

        {error && (
          <p className="text-destructive text-[11px] leading-relaxed">{error}</p>
        )}
      </div>

      {/* Result — scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* No result section here — results shown in modal */}
      </div>
    </div>
  )
}
