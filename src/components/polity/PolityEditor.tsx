import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useUIStore } from '@/store/uiStore'
import { POLITY_LABELS, type Polity } from '@/types'

const POLITY_LIST = Object.entries(POLITY_LABELS) as [Polity, { label: string; description: string }][]

export function PolityEditor() {
  const player = useGameStore((s) => s.player)
  const updatePlayerNation = useGameStore((s) => s.updatePlayerNation)
  const setShowPolityEditor = useUIStore((s) => s.setShowPolityEditor)

  const [form, setForm] = useState({
    customName:        player?.customName        ?? player?.name        ?? '',
    customCapital:     player?.customCapital     ?? player?.capital     ?? '',
    customPolity:      (player?.customPolity     ?? player?.polity      ?? 'republic') as Polity,
    customFlag:        player?.customFlag        ?? player?.flag        ?? '',
    customDescription: player?.customDescription ?? player?.context    ?? '',
    customColor:       player?.customColor       ?? player?.color       ?? '#d4a843',
  })

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const save = () => {
    updatePlayerNation({
      customName:        form.customName.trim()        || undefined,
      customCapital:     form.customCapital.trim()     || undefined,
      customPolity:      form.customPolity,
      customFlag:        form.customFlag.trim()        || undefined,
      customDescription: form.customDescription.trim() || undefined,
      customColor:       form.customColor,
    })
    setShowPolityEditor(false)
  }

  if (!player) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="font-cinzel text-xl text-primary tracking-widest">Reshape Your Nation</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Rename your country, change its government, define its identity.
            Every AI interaction will reflect these changes.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase mb-1.5">
              Nation Name
            </label>
            <input
              value={form.customName}
              onChange={(e) => set('customName', e.target.value)}
              placeholder={player.name}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
            <p className="text-[10px] text-muted-foreground mt-1">e.g. "Bharat" instead of "India (British)"</p>
          </div>

          {/* Capital + Flag row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase mb-1.5">
                Capital
              </label>
              <input
                value={form.customCapital}
                onChange={(e) => set('customCapital', e.target.value)}
                placeholder={player.capital}
                className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase mb-1.5">
                Flag (emoji)
              </label>
              <input
                value={form.customFlag}
                onChange={(e) => set('customFlag', e.target.value)}
                placeholder={player.flag}
                className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Map colour */}
          <div>
            <label className="block font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase mb-1.5">
              Map Colour
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.customColor}
                onChange={(e) => set('customColor', e.target.value)}
                className="w-12 h-10 rounded-sm border border-border bg-input cursor-pointer p-0.5"
              />
              <span className="font-mono-game text-sm text-muted-foreground">{form.customColor}</span>
            </div>
          </div>

          {/* Polity */}
          <div>
            <label className="block font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase mb-2">
              Form of Government
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {POLITY_LIST.map(([value, { label, description }]) => (
                <button
                  key={value}
                  onClick={() => set('customPolity', value)}
                  className={`text-left px-3 py-2 rounded-sm border text-left transition-all ${
                    form.customPolity === value
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="text-xs font-medium">{label}</div>
                  <div className="text-[10px] text-muted-foreground">{description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Lore / description */}
          <div>
            <label className="block font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase mb-1.5">
              National Identity & Lore
            </label>
            <textarea
              value={form.customDescription}
              onChange={(e) => set('customDescription', e.target.value)}
              placeholder="Describe your nation's unique identity, ideology, and goals. The AI will use this in all interactions."
              rows={3}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Live preview */}
          <div className="bg-muted/30 border border-border rounded-sm p-4">
            <p className="font-cinzel text-[9px] tracking-widest text-primary uppercase mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-sm flex-shrink-0 border border-border"
                style={{ background: form.customColor }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{form.customFlag || player.flag}</span>
                  <span className="font-cinzel text-sm text-foreground font-semibold">
                    {form.customName || player.name}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {POLITY_LABELS[form.customPolity].label} · {form.customCapital || player.capital}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={save}
              className="flex-1 bg-primary text-primary-foreground font-cinzel text-xs tracking-widest py-3 rounded-sm hover:opacity-90 transition-opacity"
            >
              CONFIRM CHANGES
            </button>
            <button
              onClick={() => setShowPolityEditor(false)}
              className="px-6 border border-border text-muted-foreground font-cinzel text-xs tracking-widest rounded-sm hover:border-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
