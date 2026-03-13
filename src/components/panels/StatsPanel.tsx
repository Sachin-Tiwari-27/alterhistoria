import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { COUNTRIES } from "@/data/countries";
import type { NationStats } from "@/types";

const STAT_CONFIG: {
  key: keyof NationStats;
  label: string;
  color: string;
  max: number;
}[] = [
  { key: "gdp", label: "GDP Index", color: "bg-amber-500", max: 100 },
  { key: "trade", label: "Trade", color: "bg-amber-400", max: 100 },
  { key: "hdi", label: "HDI", color: "bg-blue-500", max: 100 },
  { key: "freedom", label: "Freedom", color: "bg-cyan-500", max: 100 },
  { key: "democracy", label: "Democracy", color: "bg-sky-500", max: 100 },
  { key: "military", label: "Military", color: "bg-red-600", max: 100 },
  { key: "tech", label: "Technology", color: "bg-emerald-500", max: 100 },
  { key: "stability", label: "Stability", color: "bg-green-500", max: 100 },
];

function StatBar({
  label,
  value,
  color,
  max,
}: {
  label: string;
  value: number;
  color: string;
  max: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-mono-game text-foreground">
          {value}
        </span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full stat-bar-fill`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function StatsPanel() {
  const player = useGameStore((s) => s.player);
  const divergence = useGameStore((s) => s.divergence);
  const getPlayerDisplayName = useGameStore((s) => s.getPlayerDisplayName);
  const getPlayerPolityLabel = useGameStore((s) => s.getPlayerPolityLabel);
  const setShowPolityEditor = useUIStore((s) => s.setShowPolityEditor);

  if (!player) {
    return (
      <aside className="w-56 flex-shrink-0 bg-card border-r border-border flex flex-col">
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

  return (
    <aside className="w-56 flex-shrink-0 bg-card border-r border-border flex flex-col overflow-hidden">
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

      {/* Stats */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Economy */}
        <p className="font-cinzel text-[8px] tracking-widest text-muted-foreground uppercase border-b border-border pb-1 mb-2">
          Economy
        </p>
        {STAT_CONFIG.slice(0, 2).map((s) => (
          <StatBar
            key={s.key}
            label={s.label}
            value={player[s.key] as number}
            color={s.color}
            max={s.max}
          />
        ))}

        <p className="font-cinzel text-[8px] tracking-widest text-muted-foreground uppercase border-b border-border pb-1 mb-2 mt-3">
          Society
        </p>
        {STAT_CONFIG.slice(2, 5).map((s) => (
          <StatBar
            key={s.key}
            label={s.label}
            value={player[s.key] as number}
            color={s.color}
            max={s.max}
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

        <p className="font-cinzel text-[8px] tracking-widest text-muted-foreground uppercase border-b border-border pb-1 mb-2 mt-3">
          Power
        </p>
        {STAT_CONFIG.slice(5).map((s) => (
          <StatBar
            key={s.key}
            label={s.label}
            value={player[s.key] as number}
            color={s.color}
            max={s.max}
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
                ✓ {n?.name ?? id}
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
                ✗ {n?.name ?? id}
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
