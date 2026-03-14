import { useState } from 'react'
import { searchCountries } from '@/data/countries'
import { useDiploStore } from '@/store/diploStore'
import { useGameStore } from '@/store/gameStore'
import { COUNTRIES } from '@/data/countries'

export function NationSearch() {
  const [query, setQuery] = useState('')

  const player = useGameStore((s) => s.player)
  const activeChannel = useDiploStore((s) => s.activeChannel)
  const addToChannel = useDiploStore((s) => s.addToChannel)
  const addMessage = useDiploStore((s) => s.addMessage)
  const getHistory = useDiploStore((s) => s.getHistory)

  const results = query.length >= 2
    ? searchCountries(query)
        .filter((c) => c.id !== player?.id && !activeChannel.includes(c.id))
        .slice(0, 8)
    : []

  const addNation = (id: string) => {
    addToChannel(id)
    setQuery('')
    // Send greeting on first contact
    const hist = getHistory(id)
    if (hist.length === 0) {
      const nd = COUNTRIES[id]
      addMessage(id, {
        from: id,
        fromName: nd?.name ?? id,
        text: `Greetings. We note your nation's approach with interest. What matter brings you to contact us?`,
        // eslint-disable-next-line react-hooks/purity
        timestamp: Date.now(),
      })
    }
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Add nation to channel…"
        className="w-full bg-input border border-border rounded-sm px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
      />
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-sm shadow-xl z-20 max-h-48 overflow-y-auto mt-0.5">
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => addNation(c.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left"
            >
              <span>{c.flag}</span>
              <span className="text-foreground">{c.name}</span>
              <span className="ml-auto text-muted-foreground font-cinzel text-[8px]">{c.region}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
