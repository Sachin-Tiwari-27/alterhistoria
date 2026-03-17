import { useEffect, useState, useCallback } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useGameStore } from '@/store/gameStore'
import { TopBar } from '@/components/layout/TopBar'
import { TickerBar } from '@/components/layout/TickerBar'
import { WorldMap } from '@/components/map/WorldMap'
import { StatsPanel } from '@/components/panels/StatsPanel'
import { RightPanel } from '@/components/panels/RightPanel'
import { ActionBox } from '@/components/ActionBox'
import { NationSelectOverlay } from '@/components/nation-select/NationSelectOverlay'
import { PolityEditor } from '@/components/polity/PolityEditor'
import { ApiKeyModal } from '@/components/ApiKeyModal'
import { SettingsModal } from '@/components/SettingsModal'
import { WorldRankingsModal } from '@/components/WorldRankingsModal'
import { TimelineDrawer } from '@/components/layout/TimelineDrawer'
import { TimeJumpModal } from '@/components/timejump/TimeJumpModal'
import { ConsequenceToast } from '@/components/layout/ConsequenceToast'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function App() {
  const theme = useUIStore((s) => s.theme)
  const showApiModal = useUIStore((s) => s.showApiModal)
  const showNationSelect = useUIStore((s) => s.showNationSelect)
  const showPolityEditor = useUIStore((s) => s.showPolityEditor)
  const showSettings = useUIStore((s) => s.showSettings)
  const showWorldRankings = useUIStore((s) => s.showWorldRankings)
  const showTimeline = useUIStore((s) => s.showTimeline)
  const showTimeJumpModal = useUIStore((s) => s.showTimeJumpModal)
  const showLeftPanel = useUIStore((s) => s.showLeftPanel)
  const showRightPanel = useUIStore((s) => s.showRightPanel)
  const toggleLeftPanel = useUIStore((s) => s.toggleLeftPanel)
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel)
  const player = useGameStore((s) => s.player)
  const updatePlayerNation = useGameStore((s) => s.updatePlayerNation)
  const apiKey = useGameStore((s) => s.apiKey)
  const setShowApiModal = useUIStore((s) => s.setShowApiModal)
  const setShowNationSelect = useUIStore((s) => s.setShowNationSelect)

  const [toastNarrative, setToastNarrative] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      if (e.key === '[') toggleLeftPanel()
      if (e.key === ']') toggleRightPanel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleLeftPanel, toggleRightPanel])
  
  // Auto-skip setup if player already exists
  useEffect(() => {
    if (player && apiKey) {
      setShowApiModal(false)
      setShowNationSelect(false)

      // Sanitize friends/foes (handle previous AI hallucinations)
      const sanitize = (list: any[]) => list.map(item => typeof item === 'string' ? item : (item?.id ?? null)).filter(Boolean)
      const cleanFriends = sanitize(player.friends)
      const cleanFoes = sanitize(player.foes)
      
      if (cleanFriends.length !== player.friends.length || cleanFoes.length !== player.foes.length) {
         updatePlayerNation({ friends: cleanFriends, foes: cleanFoes })
      }
    }
  }, [player, apiKey, setShowApiModal, setShowNationSelect, updatePlayerNation])

  const handleConsequence = useCallback((narrative: string) => {
    setToastNarrative(narrative)
  }, [])

  const dismissToast = useCallback(() => setToastNarrative(null), [])

  return (
    <div className="h-screen flex flex-col overflow-hidden font-garamond bg-background text-foreground">
      <TopBar />
      <TickerBar />
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Panel Wrapper */}
        <div className={`transition-[width] duration-300 ease-in-out overflow-hidden flex-shrink-0 ${showLeftPanel ? 'w-56' : 'w-0'}`}>
          <div className="w-56 h-full flex flex-col">
            <StatsPanel />
          </div>
        </div>

        {/* Center Content */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0 relative">
          <div className="flex-1 relative overflow-hidden min-h-0 bg-background">
            <WorldMap />

            {/* Panel Toggles */}
            <button
              onClick={toggleLeftPanel}
              className={`absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center bg-card border border-border text-foreground hover:border-primary hover:text-primary transition-colors rounded-sm shadow-sm ${!showLeftPanel ? 'animate-pulse group/btn' : ''}`}
              title={showLeftPanel ? "Hide Stats ([)" : "Show Stats (])"}
            >
              <div className={!showLeftPanel ? 'group-hover/btn:translate-x-0.5 transition-transform' : ''}>
                {showLeftPanel ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </div>
            </button>
            <button
              onClick={toggleRightPanel}
              className={`absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-card border border-border text-foreground hover:border-primary hover:text-primary transition-colors rounded-sm shadow-sm ${!showRightPanel ? 'animate-pulse group/btn' : ''}`}
              title={showRightPanel ? "Hide Advisor (])" : "Show Advisor ([)"}
            >
              <div className={!showRightPanel ? 'group-hover/btn:-translate-x-0.5 transition-transform' : ''}>
                {showRightPanel ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </div>
            </button>
          </div>
          <ActionBox onConsequence={handleConsequence} />
        </div>

        {/* Right Panel Wrapper */}
        <div className={`transition-[width] duration-300 ease-in-out overflow-hidden flex-shrink-0 ${showRightPanel ? 'w-72' : 'w-0'}`}>
          <div className="w-72 h-full flex flex-col">
            <RightPanel />
          </div>
        </div>
      </div>

      {/* Consequence Toast (above action box) */}
      {toastNarrative && (
        <ConsequenceToast narrative={toastNarrative} onDismiss={dismissToast} />
      )}

      {/* Overlays & Modals */}
      {showApiModal && <ApiKeyModal />}
      {showNationSelect && <NationSelectOverlay />}
      {showPolityEditor && player && <PolityEditor />}
      {showSettings && <SettingsModal />}
      {showWorldRankings && <WorldRankingsModal />}
      {showTimeline && <TimelineDrawer />}
      {showTimeJumpModal && <TimeJumpModal />}
    </div>
  )
}
