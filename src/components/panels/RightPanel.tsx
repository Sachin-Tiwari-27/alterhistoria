import { useUIStore, type Tab } from '@/store/uiStore'
import { AdvisorChat } from '@/components/advisor/AdvisorChat'
import { DiploChannel } from '@/components/diplomacy/DiploChannel'
import { EventFeed } from '@/components/events/EventFeed'
import { TimeJump } from '@/components/timejump/TimeJump'

const TABS: { id: Tab; label: string }[] = [
  { id: 'advisor',   label: 'Advisor'   },
  { id: 'diplomacy', label: 'Diplomacy' },
  { id: 'events',    label: 'Events'    },
  { id: 'jump',      label: 'Time Jump' },
]

export function RightPanel() {
  const activeTab = useUIStore((s) => s.activeTab)
  const setTab = useUIStore((s) => s.setTab)

  return (
    <aside className="w-72 h-full flex-shrink-0 bg-card border-l border-border flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border flex-shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 font-cinzel text-[8px] tracking-widest uppercase transition-colors border-r border-border last:border-r-0 ${
              activeTab === t.id
                ? 'text-primary border-b-2 border-b-primary bg-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === 'advisor'   && <AdvisorChat />}
        {activeTab === 'diplomacy' && <DiploChannel />}
        {activeTab === 'events'    && <EventFeed />}
        {activeTab === 'jump'      && <TimeJump />}
      </div>
    </aside>
  )
}
