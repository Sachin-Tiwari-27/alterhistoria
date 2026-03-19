import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { COUNTRIES } from "@/data/countries";
import { useState } from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import type { NationStats } from "@/types";
import { getStatLevel, STAT_THRESHOLDS } from "@/types";

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  tooltip: string;
  statKey: keyof NationStats;
}

function StatBar({ label, value, max, tooltip, statKey }: StatBarProps) {
  const [showTip, setShowTip] = useState(false);
  const pct = Math.min((value / max) * 100, 100);
  const level = getStatLevel(statKey, value);

  const barColor =
    level === "critical"
      ? "bg-red-500"
      : level === "warning"
        ? "bg-amber-500"
        : "bg-green-500";

  const labelColor =
    level === "critical"
      ? "text-red-400"
      : level === "warning"
        ? "text-amber-400"
        : "text-muted-foreground";

  const thresholds = STAT_THRESHOLDS[statKey as keyof typeof STAT_THRESHOLDS];

  return (
    <div className="mb-2 relative">
      <div
        className="flex justify-between items-baseline mb-0.5 cursor-help"
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
      >
        <span
          className={`text-[10px] underline decoration-dotted underline-offset-2 flex items-center gap-1 ${labelColor}`}
        >
          {level === "critical" && (
            <XCircle size={9} className="text-red-500 flex-shrink-0" />
          )}
          {level === "warning" && (
            <AlertTriangle size={9} className="text-amber-500 flex-shrink-0" />
          )}
          {label}
        </span>
        <span className="text-[10px] font-mono-game text-foreground">
          {Math.round(value)}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
        {/* Threshold tick marks */}
        {thresholds && (
          <>
            <div
              className="absolute top-0 bottom-0 w-px bg-red-900/60 z-10"
              style={{ left: `${(thresholds.critical / max) * 100}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-px bg-amber-900/60 z-10"
              style={{ left: `${(thresholds.warning / max) * 100}%` }}
            />
          </>
        )}
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500 stat-bar-fill`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showTip && (
        <div className="absolute left-0 top-full mt-1 z-50 w-56 bg-card border border-border rounded-sm px-2.5 py-2 text-[10px] text-muted-foreground leading-relaxed shadow-xl pointer-events-none">
          {tooltip}
          {thresholds && (
            <div className="mt-1 border-t border-border pt-1 space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{" "}
                Critical below {thresholds.critical}
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />{" "}
                Warning below {thresholds.warning}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const STAT_CONFIG: {
  key: keyof NationStats;
  label: string;
  max: number;
  tooltip: string;
}[] = [
  {
    key: "gdp",
    label: "GDP Index",
    max: 100,
    tooltip:
      "Gross Domestic Product. Drives revenue, enables large programs. Falls with instability.",
  },
  {
    key: "trade",
    label: "Trade",
    max: 100,
    tooltip:
      "International trade volume. Generates revenue and diplomatic influence.",
  },
  {
    key: "hdi",
    label: "HDI",
    max: 100,
    tooltip:
      "Human Development Index: education and living standards. Multiplies Tech/GDP growth.",
  },
  {
    key: "freedom",
    label: "Freedom",
    max: 100,
    tooltip:
      "Civil liberties. Low freedom risks uprisings and international condemnation.",
  },
  {
    key: "democracy",
    label: "Democracy",
    max: 100,
    tooltip:
      "Democratic governance. Affects diplomatic relations and government legitimacy.",
  },
  {
    key: "military",
    label: "Military",
    max: 100,
    tooltip:
      "Armed forces strength. Determines war outcomes and territorial deterrence.",
  },
  {
    key: "tech",
    label: "Technology",
    max: 100,
    tooltip:
      "Industrial and scientific capacity. Scales with HDI. Drives long-term competitiveness.",
  },
  {
    key: "stability",
    label: "Stability",
    max: 100,
    tooltip:
      "Social and government stability. Below 25: crises trigger automatically each turn.",
  },
];

export function StatsPanel() {
  const player = useGameStore((s) => s.player);
  const divergence = useGameStore((s) => s.divergence);
  const activeCrises = useGameStore((s) => s.activeCrises);
  const resolveCrisis = useGameStore((s) => s.resolveCrisis);
  const getPlayerDisplayName = useGameStore((s) => s.getPlayerDisplayName);
  const getPlayerPolityLabel = useGameStore((s) => s.getPlayerPolityLabel);
  const setShowPolityEditor = useUIStore((s) => s.setShowPolityEditor);

  if (!player) {
    return (
      <aside className="w-56 h-full flex-shrink-0 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <p className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase">
            National Statistics
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-[11px] text-muted-foreground text-center italic leading-relaxed">
            Select a nation to begin your story
          </p>
        </div>
      </aside>
    );
  }

  const flag = player.customFlag ?? player.flag;
  const capital = player.customCapital ?? player.capital;
  const reserve = Math.floor(player.treasury);
  const revenue = Math.floor(player.gdp * 0.05 + player.trade * 0.03);

  const criticalStats = STAT_CONFIG.filter(
    (s) =>
      getStatLevel(s.key as keyof NationStats, player[s.key] as number) ===
      "critical",
  );

  return (
    <aside className="w-56 h-full flex-shrink-0 bg-card border-r border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{flag}</span>
          <div className="min-w-0">
            <div className="font-cinzel text-[11px] text-foreground font-semibold truncate leading-tight">
              {getPlayerDisplayName()}
            </div>
            <div className="text-[9px] text-muted-foreground truncate">
              {getPlayerPolityLabel()} · {capital}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowPolityEditor(true)}
          className="w-full mt-2 border border-border text-[9px] font-cinzel tracking-widest text-muted-foreground hover:border-primary hover:text-primary transition-colors py-1 rounded-sm uppercase"
        >
          Edit Nation Identity
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Active Crises */}
        {activeCrises.length > 0 && (
          <div className="mb-3">
            <p className="font-cinzel text-[8px] tracking-widest text-red-400 uppercase border-b border-red-900/40 pb-1 mb-2">
              ⚠ Active Crises
            </p>
            {activeCrises.map((crisis) => (
              <div
                key={crisis.id}
                className="mb-1.5 bg-red-950/30 border border-red-900/40 rounded-sm p-2"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <div className="text-[10px] font-cinzel text-red-400 font-semibold">
                      {crisis.title}
                    </div>
                    <div className="text-[9px] text-muted-foreground leading-snug mt-0.5">
                      {crisis.description}
                    </div>
                    <div className="text-[8px] text-red-500 mt-1">
                      {crisis.turnsRemaining > 0
                        ? `${crisis.turnsRemaining} turn${crisis.turnsRemaining !== 1 ? "s" : ""} to address`
                        : "Applying penalty now…"}
                    </div>
                  </div>
                  <button
                    onClick={() => resolveCrisis(crisis.id)}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5"
                    title="Dismiss (if resolved)"
                  >
                    <XCircle size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Critical stat alert */}
        {criticalStats.length > 0 && activeCrises.length === 0 && (
          <div className="mb-3 bg-amber-950/30 border border-amber-900/40 rounded-sm p-2">
            <p className="text-[9px] text-amber-400 font-cinzel">
              ⚠ {criticalStats.map((s) => s.label).join(", ")} at critical
              levels
            </p>
          </div>
        )}

        {/* Economy */}
        <p className="font-cinzel text-[8px] tracking-widest text-muted-foreground uppercase border-b border-border pb-1 mb-2">
          Economy & Finance
        </p>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div
            className={`p-2 rounded-sm border ${reserve < 5 ? "bg-red-950/30 border-red-900/50" : "bg-muted/50 border-border/50"}`}
          >
            <div className="text-[8px] font-cinzel text-muted-foreground uppercase mb-1">
              Reserve
            </div>
            <div
              className={`text-sm font-mono-game font-bold ${reserve < 5 ? "text-red-400" : "text-amber-500"}`}
            >
              ₤{reserve}B
            </div>
            <div className="text-[7px] text-green-500 font-mono-game mt-0.5">
              +{revenue}B/qtr
            </div>
          </div>
          <div className="bg-muted/50 p-2 rounded-sm border border-border/50">
            <div className="text-[8px] font-cinzel text-muted-foreground uppercase mb-1">
              HDI Eff
            </div>
            <div className="text-sm font-mono-game text-sky-500 font-bold">
              {Math.min(player.hdi / 50, 2.0).toFixed(1)}×
            </div>
            <div className="text-[7px] text-muted-foreground font-mono-game mt-0.5">
              {player.hdi >= 50 ? "Tech boost" : "Tech drag"}
            </div>
          </div>
        </div>
        {STAT_CONFIG.slice(0, 2).map((s) => (
          <StatBar
            key={s.key}
            label={s.label}
            value={player[s.key] as number}
            max={s.max}
            tooltip={s.tooltip}
            statKey={s.key as keyof NationStats}
          />
        ))}

        {/* Society */}
        <p className="font-cinzel text-[8px] tracking-widest text-muted-foreground uppercase border-b border-border pb-1 mb-2 mt-3">
          Society
        </p>
        {STAT_CONFIG.slice(2, 5).map((s) => (
          <StatBar
            key={s.key}
            label={s.label}
            value={player[s.key] as number}
            max={s.max}
            tooltip={s.tooltip}
            statKey={s.key as keyof NationStats}
          />
        ))}
        <div className="mb-2">
          <div className="flex justify-between items-baseline mb-0.5">
            <span className="text-[10px] text-muted-foreground">
              Population
            </span>
            <span className="text-[10px] font-mono-game text-foreground">
              {player.population}M
            </span>
          </div>
        </div>

        {/* Power */}
        <p className="font-cinzel text-[8px] tracking-widest text-muted-foreground uppercase border-b border-border pb-1 mb-2 mt-3">
          Power
        </p>
        {STAT_CONFIG.slice(5).map((s) => (
          <StatBar
            key={s.key}
            label={s.label}
            value={player[s.key] as number}
            max={s.max}
            tooltip={s.tooltip}
            statKey={s.key as keyof NationStats}
          />
        ))}

        {/* Relations */}
        <p className="font-cinzel text-[8px] tracking-widest text-muted-foreground uppercase border-b border-border pb-1 mb-2 mt-3">
          Relations
        </p>
        <div className="flex flex-wrap gap-1">
          {player.friends.length === 0 && player.foes.length === 0 && (
            <span className="text-[10px] text-muted-foreground italic">
              No alliances yet
            </span>
          )}
          {player.friends.map((id) => {
            const n = COUNTRIES[id];
            return (
              <span
                key={id}
                className="text-[9px] px-1.5 py-0.5 rounded-sm bg-green-900/30 text-green-400 border border-green-900"
              >
                ✓ {typeof id === "string" ? (n?.name ?? id) : "Ally"}
              </span>
            );
          })}
          {player.foes.map((id) => {
            const n = COUNTRIES[id];
            return (
              <span
                key={id}
                className="text-[9px] px-1.5 py-0.5 rounded-sm bg-red-900/30 text-red-400 border border-red-900"
              >
                ✗ {typeof id === "string" ? (n?.name ?? id) : "Rival"}
              </span>
            );
          })}
        </div>

        {/* Divergence */}
        <div className="mt-4 p-2 bg-muted/40 border border-border rounded-sm text-center">
          <div className="text-[8px] font-cinzel tracking-widest text-muted-foreground uppercase mb-0.5">
            Timeline Divergence
          </div>
          <div className="text-xl font-mono-game text-primary font-bold">
            {divergence}
          </div>
          <div className="text-[9px] text-muted-foreground">
            pts from real history
          </div>
        </div>
      </div>
    </aside>
  );
}
