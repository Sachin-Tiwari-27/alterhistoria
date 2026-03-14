import { COUNTRIES } from '@/data/countries'

interface RelationTagsProps {
  friends: string[]
  foes: string[]
}

export function RelationTags({ friends, foes }: RelationTagsProps) {
  if (friends.length === 0 && foes.length === 0) {
    return (
      <span className="text-[10px] text-muted-foreground italic">No alliances yet</span>
    )
  }

  return (
    <div className="flex flex-wrap gap-1">
      {friends.map((id) => {
        const n = COUNTRIES[id]
        return (
          <span
            key={id}
            className="text-[9px] px-1.5 py-0.5 rounded-sm bg-green-900/30 text-green-400 border border-green-900"
          >
            ✓ {n?.name ?? id}
          </span>
        )
      })}
      {foes.map((id) => {
        const n = COUNTRIES[id]
        return (
          <span
            key={id}
            className="text-[9px] px-1.5 py-0.5 rounded-sm bg-red-900/30 text-red-400 border border-red-900"
          >
            ✗ {n?.name ?? id}
          </span>
        )
      })}
    </div>
  )
}
