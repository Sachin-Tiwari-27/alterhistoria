interface LegendItem {
  color: string;
  label: string;
}

const ITEMS: LegendItem[] = [
  { color: "#d4a843", label: "Your nation" },
  { color: "#4a9060", label: "Ally" },
  { color: "#9a3535", label: "Rival" },
  { color: "#1e3a50", label: "Neutral" },
];

export function MapLegend() {
  return (
    <div className="absolute bottom-3 left-3 bg-card/90 border border-border rounded-sm px-3 py-2 pointer-events-none">
      {ITEMS.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2 mb-1 last:mb-0">
          <div
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ background: color }}
          />
          <span className="font-cinzel text-[9px] tracking-wide text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
