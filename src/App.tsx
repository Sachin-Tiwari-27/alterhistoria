import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";
import { TopBar } from "@/components/layout/TopBar";
import { TickerBar } from "@/components/layout/TickerBar";
import { WorldMap } from "@/components/map/WorldMap";
import { StatsPanel } from "@/components/panels/StatsPanel";
import { RightPanel } from "@/components/panels/RightPanel";
import { ActionBox } from "@/components/ActionBox";
import { NationSelectOverlay } from "@/components/nation-select/NationSelectOverlay";
import { PolityEditor } from "@/components/polity/PolityEditor";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { useGameStore } from "@/store/gameStore";

export default function App() {
  const { theme } = useUIStore();
  const { showApiModal, showNationSelect, showPolityEditor } = useUIStore();
  const player = useGameStore((s) => s.player);

  // Apply dark/light class to html
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="h-screen flex flex-col overflow-hidden font-garamond">
      <TopBar />
      <TickerBar />
      <div className="flex flex-1 overflow-hidden">
        <StatsPanel />
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            <WorldMap />
          </div>
          <ActionBox />
        </div>
        <RightPanel />
      </div>

      {showApiModal && <ApiKeyModal />}
      {showNationSelect && <NationSelectOverlay />}
      {showPolityEditor && player && <PolityEditor />}
    </div>
  );
}
