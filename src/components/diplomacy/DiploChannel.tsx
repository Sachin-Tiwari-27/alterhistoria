import { useState, useRef, useEffect } from "react";
import { X, Plus, Save, Users } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { useDiploStore } from "@/store/diploStore";
import { callAI, buildDiplomacySystemPrompt } from "@/lib/ai";
import { COUNTRIES, searchCountries } from "@/data/countries";
import type { AIMessage } from "@/lib/ai";

export function DiploChannel() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<
    (typeof COUNTRIES)[string][]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [showGroupInput, setShowGroupInput] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const player = useGameStore((s) => s.player);
  const nations = useGameStore((s) => s.nations);

  const activeChannel = useDiploStore((s) => s.activeChannel);
  const groups = useDiploStore((s) => s.groups);
  const addToChannel = useDiploStore((s) => s.addToChannel);
  const removeFromChannel = useDiploStore((s) => s.removeFromChannel);
  const clearChannel = useDiploStore((s) => s.clearChannel);
  const saveGroup = useDiploStore((s) => s.saveGroup);
  const loadGroup = useDiploStore((s) => s.loadGroup);
  const deleteGroup = useDiploStore((s) => s.deleteGroup);
  const addMessage = useDiploStore((s) => s.addMessage);
  const getHistory = useDiploStore((s) => s.getHistory);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChannel, loading]);

  const handleSearch = (q: string) => {
    setSearch(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchResults(
      searchCountries(q)
        .filter((c) => c.id !== player?.id && !activeChannel.includes(c.id))
        .slice(0, 8),
    );
  };

  const addNation = (id: string) => {
    addToChannel(id);
    setSearch("");
    setSearchResults([]);
    // Greet if first contact
    const hist = getHistory(id);
    if (hist.length === 0) {
      const nd = COUNTRIES[id];
      addMessage(id, {
        from: id,
        fromName: nd?.name ?? id,
        text: `Greetings from ${nd?.name ?? id}. We note your nation's approach with interest. What matter brings you to contact us?`,
        timestamp: Date.now(),
      });
    }
  };

  const send = async () => {
    if (!activeChannel.length || !input.trim() || loading || !player) return;
    const text = input.trim();
    setInput("");

    // Store player message in all channels
    activeChannel.forEach((id) => {
      addMessage(id, {
        from: "player",
        fromName: player.customName ?? player.name,
        text,
        timestamp: Date.now(),
      });
    });

    setLoading(true);
    const isGroup = activeChannel.length > 1;
    const groupMemberNames = activeChannel.map(
      (id) => nations[id]?.name ?? COUNTRIES[id]?.name ?? id,
    );

    // Get AI response from each nation
    for (const targetId of activeChannel) {
      const nd = COUNTRIES[targetId];
      if (!nd) continue;
      const system = buildDiplomacySystemPrompt(
        targetId,
        nd.name,
        nd.context,
        isGroup,
        groupMemberNames,
      );
      const hist = getHistory(targetId);
      const history: AIMessage[] = hist.map((m) => ({
        role: m.from === "player" ? "user" : "assistant",
        content: m.text,
      }));
      try {
        const reply = await callAI(system, history, 400);
        addMessage(targetId, {
          from: targetId,
          fromName: nd.name,
          text: reply,
          timestamp: Date.now(),
        });
      } catch {
        addMessage(targetId, {
          from: targetId,
          fromName: nd.name,
          text: "No response received.",
          timestamp: Date.now(),
        });
      }
    }
    setLoading(false);
  };

  // Collect all messages from active channels in timestamp order
  const allMessages = activeChannel
    .flatMap((id) => getHistory(id).map((m) => ({ ...m, channelId: id })))
    .sort((a, b) => a.timestamp - b.timestamp);

  if (!player) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-xs text-muted-foreground italic text-center">
          Select a nation to open diplomatic channels.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="p-3 border-b border-border flex-shrink-0 space-y-2">
        {/* Search */}
        <div className="relative">
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Add nation to channel…"
            className="w-full bg-input border border-border rounded-sm px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-sm shadow-xl z-20 max-h-48 overflow-y-auto mt-0.5">
              {searchResults.map((c) => (
                <button
                  key={c.id}
                  onClick={() => addNation(c.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left"
                >
                  <span>{c.flag}</span>
                  <span className="text-foreground">{c.name}</span>
                  <span className="ml-auto text-muted-foreground font-cinzel text-[8px]">
                    {c.region}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active channel tags */}
        {activeChannel.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <span className="font-cinzel text-[8px] tracking-widest text-muted-foreground uppercase">
              Channel:
            </span>
            {activeChannel.map((id) => {
              const nd = COUNTRIES[id];
              return (
                <span
                  key={id}
                  className="flex items-center gap-1 bg-muted border border-border rounded-sm px-1.5 py-0.5 text-[10px]"
                >
                  {nd?.flag} {nd?.name ?? id}
                  <button
                    onClick={() => removeFromChannel(id)}
                    className="text-muted-foreground hover:text-destructive ml-0.5"
                  >
                    <X size={9} />
                  </button>
                </span>
              );
            })}
            <button
              onClick={clearChannel}
              className="text-[9px] text-muted-foreground hover:text-destructive ml-1"
            >
              clear
            </button>
          </div>
        )}

        {/* Group controls */}
        <div className="flex gap-1 items-center flex-wrap">
          {activeChannel.length > 1 && (
            <>
              {showGroupInput ? (
                <>
                  <input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && groupName.trim()) {
                        saveGroup(groupName.trim(), activeChannel);
                        setGroupName("");
                        setShowGroupInput(false);
                      }
                    }}
                    placeholder="Group name…"
                    className="bg-input border border-border rounded-sm px-2 py-1 text-[10px] w-28 outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => {
                      if (groupName.trim()) {
                        saveGroup(groupName.trim(), activeChannel);
                        setGroupName("");
                        setShowGroupInput(false);
                      }
                    }}
                    className="text-[9px] font-cinzel tracking-wide text-primary border border-primary/40 rounded-sm px-2 py-1"
                  >
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowGroupInput(true)}
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
                title={g.nationIds
                  .map((id) => COUNTRIES[id]?.name ?? id)
                  .join(", ")}
              >
                <Users size={8} /> {g.name}
              </button>
              <button
                onClick={() => deleteGroup(g.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X size={8} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {activeChannel.length === 0 && (
          <p className="text-xs text-muted-foreground italic text-center mt-4">
            Add nations above to open a diplomatic channel. Click a country on
            the map, or search above. You can create coalition groups with
            multiple nations.
          </p>
        )}

        {allMessages.map((m, i) => {
          const isPlayer = m.from === "player";
          return (
            <div
              key={i}
              className={`flex flex-col gap-0.5 ${isPlayer ? "items-end" : "items-start"}`}
            >
              <span className="font-cinzel text-[8px] tracking-widest text-muted-foreground uppercase">
                {m.fromName}
              </span>
              <div
                className={`max-w-[90%] rounded-sm px-3 py-2 text-[11px] leading-relaxed ${
                  isPlayer
                    ? "bg-primary/10 border border-primary/20 text-foreground"
                    : "bg-muted border border-border text-foreground"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex flex-col items-start gap-0.5">
            <span className="font-cinzel text-[8px] tracking-widest text-muted-foreground uppercase">
              {activeChannel.map((id) => COUNTRIES[id]?.name ?? id).join(", ")}
            </span>
            <div className="bg-muted border border-border rounded-sm px-3 py-3">
              <div className="thinking flex gap-1">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-border flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={
            activeChannel.length
              ? "Send diplomatic message…"
              : "Add a nation first…"
          }
          disabled={loading || !activeChannel.length}
          className="flex-1 bg-input border border-border rounded-sm px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors disabled:opacity-60"
        />
        <button
          onClick={send}
          disabled={loading || !activeChannel.length || !input.trim()}
          className="bg-primary text-primary-foreground font-cinzel text-[9px] tracking-widest px-3 py-2 rounded-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          SEND
        </button>
      </div>
    </div>
  );
}
