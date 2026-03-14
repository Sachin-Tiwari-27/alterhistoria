import { useState } from 'react'
import { Save, Users, X } from 'lucide-react'
import { useDiploStore } from '@/store/diploStore'
import { COUNTRIES } from '@/data/countries'

export function GroupManager() {
  const [groupName, setGroupName] = useState('')
  const [showInput, setShowInput] = useState(false)

  const activeChannel = useDiploStore((s) => s.activeChannel)
  const groups = useDiploStore((s) => s.groups)
  const saveGroup = useDiploStore((s) => s.saveGroup)
  const loadGroup = useDiploStore((s) => s.loadGroup)
  const deleteGroup = useDiploStore((s) => s.deleteGroup)

  const handleSave = () => {
    if (!groupName.trim() || activeChannel.length < 2) return
    saveGroup(groupName.trim(), activeChannel)
    setGroupName('')
    setShowInput(false)
  }

  return (
    <div className="flex gap-1 items-center flex-wrap">
      {/* Save current channel as group */}
      {activeChannel.length > 1 && (
        <>
          {showInput ? (
            <>
              <input
                autoFocus
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Group name…"
                className="bg-input border border-border rounded-sm px-2 py-1 text-[10px] w-28 outline-none focus:border-primary text-foreground"
              />
              <button
                onClick={handleSave}
                className="text-[9px] font-cinzel tracking-wide text-primary border border-primary/40 rounded-sm px-2 py-1 hover:bg-primary/10 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => { setShowInput(false); setGroupName('') }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={10} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="flex items-center gap-1 text-[9px] text-muted-foreground border border-border rounded-sm px-2 py-1 hover:border-primary hover:text-primary transition-colors"
            >
              <Save size={9} /> Save Group
            </button>
          )}
        </>
      )}

      {/* Saved groups */}
      {groups.map((g) => (
        <span key={g.id} className="flex items-center gap-0.5">
          <button
            onClick={() => loadGroup(g.id)}
            className="flex items-center gap-1 text-[9px] text-muted-foreground border border-border rounded-sm px-1.5 py-0.5 hover:border-primary hover:text-primary transition-colors"
            title={g.nationIds.map((id) => COUNTRIES[id]?.name ?? id).join(', ')}
          >
            <Users size={8} /> {g.name}
          </button>
          <button
            onClick={() => deleteGroup(g.id)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X size={8} />
          </button>
        </span>
      ))}
    </div>
  )
}
