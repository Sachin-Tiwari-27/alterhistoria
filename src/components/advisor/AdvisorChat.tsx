import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { callAI, buildAdvisorSystemPrompt } from '@/lib/ai'
import type { AIMessage } from '@/lib/ai'

interface Msg { role: 'user' | 'assistant'; text: string }

export function AdvisorChat() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const player = useGameStore((s) => s.player)
  const draftAction = useGameStore((s) => s.draftAction)
  const setDraftAction = useGameStore((s) => s.setDraftAction)
  const getPlayerDisplayName = useGameStore((s) => s.getPlayerDisplayName)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  // Welcome message when player is selected
  useEffect(() => {
    if (player && msgs.length === 0) {
      const name = player.customName ?? player.name
      setMsgs([{
        role: 'assistant',
        text: `Welcome, leader of ${name}.\n\n${player.customDescription ?? player.context}\n\nThe year is 1920. Your choices will forge an alternate timeline. What is your first order of business?`,
      }])
    }
  }, [player, msgs.length])

  const send = async (overrideText?: string) => {
    const textToSubmit = overrideText ?? input.trim()
    if (!textToSubmit || loading || !player) return
    
    if (!overrideText) setInput('')
    
    setMsgs((m) => [...m, { role: 'user', text: textToSubmit }])
    setLoading(true)
    try {
      const history: AIMessage[] = msgs.map((m) => ({
        role: m.role,
        content: m.text,
      }))
      history.push({ role: 'user', content: textToSubmit })
      const reply = await callAI(buildAdvisorSystemPrompt(), history, 600)
      setMsgs((m) => [...m, { role: 'assistant', text: reply }])
    } catch (e) {
      setMsgs((m) => [...m, { role: 'assistant', text: `Error: ${e instanceof Error ? e.message : 'Unknown error'}` }])
    } finally {
      setLoading(false)
    }
  }

  // Handle incoming draft actions from ActionBox
  useEffect(() => {
    if (draftAction && player) {
      const promptText = `Please review my proposed decree: "${draftAction}". Consider my past actions and suggest improvements or highlight risks.`
      setDraftAction('')
      // Need to capture the current state for msgs, but since send() gets latest from state setter,
      // we can just call send directly. However, to avoid 'loading' race condition:
      setTimeout(() => send(promptText), 50)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftAction, player])

  if (!player) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-xs text-muted-foreground italic text-center">
          Select a nation to receive counsel from your Chief Advisor.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border flex-shrink-0">
        <p className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase">
          Chief Advisor · {getPlayerDisplayName()}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col gap-0.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <span className="font-cinzel text-[8px] tracking-widest text-muted-foreground uppercase">
              {m.role === 'user' ? getPlayerDisplayName() : 'Chief Advisor'}
            </span>
            <div
              className={`max-w-[90%] rounded-sm px-3 py-2 text-[12px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary/10 border border-primary/20 text-foreground'
                  : 'bg-muted border border-border text-foreground'
              }`}
            >
              {m.text.split('\n').map((line, j) => (
                <span key={j}>{line}{j < m.text.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start gap-0.5">
            <span className="font-cinzel text-[8px] tracking-widest text-muted-foreground uppercase">
              Chief Advisor
            </span>
            <div className="bg-muted border border-border rounded-sm px-3 py-3">
              <div className="thinking flex gap-1">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-border flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask your advisor…"
          disabled={loading}
          className="flex-1 bg-input border border-border rounded-sm px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors disabled:opacity-60"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="bg-primary text-primary-foreground font-cinzel text-[9px] tracking-widest px-3 py-2 rounded-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          ASK
        </button>
      </div>
    </div>
  )
}
