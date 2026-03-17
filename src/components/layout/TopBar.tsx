import { Sun, Moon, Globe, Edit3, Settings, BarChart3, ScrollText } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { useDiploStore } from "@/store/diploStore";

export function TopBar() {
  const year = useGameStore((s) => s.year);
  const quarter = useGameStore((s) => s.quarter);
  const turn = useGameStore((s) => s.turn);
  const divergence = useGameStore((s) => s.divergence);
  const player = useGameStore((s) => s.player);
  const getPlayerDisplayName = useGameStore((s) => s.getPlayerDisplayName);
  const getPlayerPolityLabel = useGameStore((s) => s.getPlayerPolityLabel);

  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const setShowNationSelect = useUIStore((s) => s.setShowNationSelect);
  const setShowPolityEditor = useUIStore((s) => s.setShowPolityEditor);
  const toggleSettings = useUIStore((s) => s.toggleSettings);
  const toggleWorldRankings = useUIStore((s) => s.toggleWorldRankings);
  const toggleTimeline = useUIStore((s) => s.toggleTimeline);

  const unreadCount = useDiploStore((s) => s.unreadCount);

  const flag = player?.customFlag ?? player?.flag ?? "";

  return (
    <header className="h-12 flex items-center gap-3 px-4 bg-card border-b border-border flex-shrink-0 relative">
      {/* Brand */}
      <span className="font-cinzel text-primary text-sm tracking-[0.25em] whitespace-nowrap font-semibold">
        ALTER HISTORIA
      </span>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Nation info */}
      {player ? (
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{flag}</span>
          <div className="leading-none">
            <div className="font-cinzel text-xs text-foreground tracking-wide">
              {getPlayerDisplayName()}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {getPlayerPolityLabel()}
            </div>
          </div>
          <button
            onClick={() => setShowPolityEditor(true)}
            className="ml-1 text-muted-foreground hover:text-primary transition-colors"
            title="Edit nation identity"
          >
            <Edit3 size={13} />
          </button>
        </div>
      ) : (
        <span className="font-cinzel text-[10px] tracking-widest text-muted-foreground uppercase">
          — Select Nation —
        </span>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Stats pills */}
      {player && (
        <div className="flex items-center gap-3 text-[11px] font-mono-game">
          <span className="text-muted-foreground">
            TURN <span className="text-foreground">{turn}</span>
          </span>
          <span className="text-muted-foreground">
            Q<span className="text-foreground">{quarter}</span>
          </span>
          <span className="text-muted-foreground">
            DIV <span className="text-primary">{divergence}</span>
          </span>
        </div>
      )}

      {/* Year display */}
      <div className="font-mono-game text-2xl text-primary font-bold tracking-widest ml-2">
        {year}
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        {/* Timeline / Decree History */}
        {player && (
          <button
            onClick={toggleTimeline}
            className="p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Decree History"
          >
            <ScrollText size={14} />
          </button>
        )}

        {/* World Rankings */}
        <button
          onClick={toggleWorldRankings}
          className="p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
          title="World Rankings"
        >
          <BarChart3 size={14} />
        </button>

        {/* Diplomacy unread badge */}
        {unreadCount > 0 && (
          <div className="relative -ml-1">
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[8px] font-bold rounded-full flex items-center justify-center z-10">
              {unreadCount}
            </span>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <button
          onClick={() => setShowNationSelect(true)}
          className="p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Select nation"
        >
          <Globe size={14} />
        </button>

        <button
          onClick={toggleSettings}
          className="p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
}
