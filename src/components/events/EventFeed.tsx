import { useGameStore } from "@/store/gameStore";
import type { WorldEvent } from "@/types";

const EVENT_STYLES: Record<
  WorldEvent["type"],
  { dot: string; border: string }
> = {
  world: { dot: "bg-amber-400", border: "border-l-amber-500/60" },
  diplomatic: { dot: "bg-blue-400", border: "border-l-blue-500/60" },
  military: { dot: "bg-red-500", border: "border-l-red-600/60" },
  economic: { dot: "bg-emerald-400", border: "border-l-emerald-500/60" },
  social: { dot: "bg-purple-400", border: "border-l-purple-500/60" },
};

export function EventFeed() {
  const events = useGameStore((s) => s.events);

  if (!events.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-xs text-muted-foreground italic text-center">
          World events will appear here as you advance turns.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
      {events.map((e) => {
        const style = EVENT_STYLES[e.type];
        return (
          <div key={e.id} className={`border-l-2 pl-3 py-1.5 ${style.border}`}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${style.dot} flex-shrink-0`}
              />
              <span className="font-mono-game text-[9px] text-muted-foreground">
                {e.year} Q{e.quarter}
              </span>
              <span className="font-cinzel text-[8px] text-muted-foreground uppercase tracking-wide">
                {e.type}
              </span>
            </div>
            <p className="text-[11px] text-foreground leading-relaxed">
              {e.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
