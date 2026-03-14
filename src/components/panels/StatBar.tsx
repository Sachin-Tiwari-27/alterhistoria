interface StatBarProps {
  label: string
  value: number
  color: string
  max?: number
}

export function StatBar({ label, value, color, max = 100 }: StatBarProps) {
  const pct = Math.min((value / max) * 100, 100)

  return (
    <div className="mb-2">
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-mono-game text-foreground">{value}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full stat-bar-fill`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
