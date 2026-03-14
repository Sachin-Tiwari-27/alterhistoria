import { useState } from 'react'
import { X, Settings, Key, Cpu, Trash2, RotateCcw, CheckCircle } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { useUIStore } from '@/store/uiStore'

export function SettingsModal() {
  const apiKey = useGameStore((s) => s.apiKey)
  const setApiKey = useGameStore((s) => s.setApiKey)
  const resetGame = useGameStore((s) => s.resetGame)
  const toggleSettings = useUIStore((s) => s.toggleSettings)
  const setShowApiModal = useUIStore((s) => s.setShowApiModal)

  const [keyInput, setKeyInput] = useState(apiKey ?? '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setApiKey(keyInput.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (confirm('Start a completely new game? All progress will be lost.')) {
      resetGame()
      toggleSettings()
      setShowApiModal(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-primary" />
            <span className="font-cinzel text-sm tracking-widest text-foreground uppercase">Settings</span>
          </div>
          <button onClick={toggleSettings} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* API Key */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Key size={13} className="text-muted-foreground" />
              <span className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase">OpenRouter API Key</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="sk-or-v1-..."
                className="flex-1 bg-input border border-border rounded-sm px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors font-mono"
              />
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground font-cinzel text-[9px] tracking-widest rounded-sm hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                {saved ? <CheckCircle size={12} /> : null}
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Get a free key at <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openrouter.ai</a>. No credit card required.
            </p>
            {keyInput && (
              <button
                onClick={() => { setKeyInput(''); setApiKey('') }}
                className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 size={11} /> Clear key
              </button>
            )}
          </section>

          {/* AI Models */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={13} className="text-muted-foreground" />
              <span className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase">AI Models</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted border border-border rounded-sm text-xs">
                <div>
                  <div className="text-foreground font-medium">Primary</div>
                  <div className="text-muted-foreground font-mono text-[10px]">openrouter/hunter-alpha</div>
                </div>
                <span className="text-[9px] font-cinzel tracking-widest text-primary uppercase">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-sm text-xs">
                <div>
                  <div className="text-foreground font-medium">Fallback</div>
                  <div className="text-muted-foreground font-mono text-[10px]">arcee-ai/trinity-mini:free</div>
                </div>
                <span className="text-[9px] font-cinzel tracking-widest text-muted-foreground uppercase">Auto</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              If the primary model fails, the fallback is used automatically.
            </p>
          </section>

          {/* Danger zone */}
          <section className="border-t border-border pt-4">
            <span className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase">Danger Zone</span>
            <button
              onClick={handleReset}
              className="mt-3 w-full flex items-center justify-center gap-2 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-cinzel text-[9px] tracking-widest py-2.5 rounded-sm transition-colors"
            >
              <RotateCcw size={12} /> New Game (Clears All Progress)
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
