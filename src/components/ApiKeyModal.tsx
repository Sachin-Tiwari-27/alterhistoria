import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useUIStore } from '@/store/uiStore'

export function ApiKeyModal() {
  const [key, setKey] = useState('')
  const setApiKey = useGameStore((s) => s.setApiKey)
  const setShowApiModal = useUIStore((s) => s.setShowApiModal)
  const setShowNationSelect = useUIStore((s) => s.setShowNationSelect)

  const proceed = (withKey: boolean) => {
    if (withKey && key.trim()) setApiKey(key.trim())
    setShowApiModal(false)
    setShowNationSelect(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20">
      <div className="bg-card border border-border w-[480px] max-w-[92vw] p-8 rounded-sm shadow-2xl">
        <h2 className="font-cinzel text-2xl text-primary tracking-widest mb-2">ALTER HISTORIA</h2>
        <p className="text-sm text-muted-foreground mb-1 font-cinzel tracking-wider uppercase text-xs">
          Rewrite the Century
        </p>

        <div className="my-6 border-t border-border" />

        <p className="text-sm text-foreground mb-4 leading-relaxed">
          For the best experience, connect a free{' '}
          <a
            href="https://openrouter.ai"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-2"
          >
            OpenRouter
          </a>{' '}
          API key. This uses free models (DeepSeek R1, Qwen3) to power your advisors, diplomats,
          and world simulation. Your key is stored only in this browser session.
        </p>

        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && proceed(true)}
          placeholder="sk-or-v1-..."
          className="w-full bg-input border border-border rounded-sm px-4 py-3 text-sm font-mono-game text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={() => proceed(true)}
            className="flex-1 bg-primary text-primary-foreground font-cinzel text-xs tracking-widest py-3 rounded-sm hover:opacity-90 transition-opacity"
          >
            CONNECT & PLAY
          </button>
          <button
            onClick={() => proceed(false)}
            className="flex-1 border border-border text-muted-foreground font-cinzel text-xs tracking-widest py-3 rounded-sm hover:border-primary hover:text-foreground transition-colors"
          >
            PLAY WITHOUT AI
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Get a free key at openrouter.ai — no credit card required
        </p>
      </div>
    </div>
  )
}
