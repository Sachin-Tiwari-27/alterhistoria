import { useUIStore } from "@/store/uiStore";
import { useGameStore } from "@/store/gameStore";

export function TickerBar() {
  const ticker = useGameStore((s) => s.ticker);

  return (
    <div className="h-7 flex items-center bg-background border-b border-border flex-shrink-0 overflow-hidden">
      <div className="px-3 font-cinzel text-[9px] tracking-[0.2em] text-primary border-r border-border h-full flex items-center flex-shrink-0 uppercase">
        Dispatch
      </div>
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <span
          key={ticker}
          className="ticker-scroll font-mono-game text-[10px] text-primary absolute whitespace-nowrap"
        >
          {ticker}
          &nbsp;&nbsp;&nbsp;◆&nbsp;&nbsp;&nbsp;
          {ticker}
        </span>
      </div>
    </div>
  );
}
