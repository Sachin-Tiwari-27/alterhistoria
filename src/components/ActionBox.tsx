import { useState, useRef, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import {
  executeTurn,
  generateIncomingDiplo,
  generateSuggestedActions,
  maybeCompressHistory,
} from "@/lib/ai";
import type { SuggestedActions } from "@/lib/ai";
import { useDiploStore } from "@/store/diploStore";
import { COUNTRIES } from "@/data/countries";
import {
  Plus,
  X,
  Wand2,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface ActionBoxProps {
  onConsequence?: (narrative: string) => void;
}

const CATEGORY_LABELS: (keyof SuggestedActions)[] = [
  "military",
  "economic",
  "diplomatic",
  "social",
];
const CATEGORY_COLORS: Record<keyof SuggestedActions, string> = {
  military: "text-red-400 border-red-900/50",
  economic: "text-amber-400 border-amber-900/50",
  diplomatic: "text-sky-400 border-sky-900/50",
  social: "text-green-400 border-green-900/50",
};

export function ActionBox({ onConsequence }: ActionBoxProps) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedActions | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<keyof SuggestedActions>>(
    new Set(),
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const player = useGameStore((s) => s.player);
  const year = useGameStore((s) => s.year);
  const quarter = useGameStore((s) => s.quarter);
  const actionQueue = useGameStore((s) => s.actionQueue);
  const addToQueue = useGameStore((s) => s.addToQueue);
  const removeFromQueue = useGameStore((s) => s.removeFromQueue);
  const clearQueue = useGameStore((s) => s.clearQueue);
  const applyTurnResult = useGameStore((s) => s.applyTurnResult);
  const setDraftAction = useGameStore((s) => s.setDraftAction);
  const getPlayerDisplayName = useGameStore((s) => s.getPlayerDisplayName);
  const checkAndApplyCrises = useGameStore((s) => s.checkAndApplyCrises);
  const setTab = useUIStore((s) => s.setTab);

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [draft]);

  const addDraftToQueue = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addToQueue(trimmed);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      if (actionQueue.length > 0 || draft.trim()) handleExecute();
    }
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      addDraftToQueue();
    }
  };

  const handleExecute = async () => {
    if (!player) return;
    // Commit any unsaved draft first
    const allActions = draft.trim()
      ? [...actionQueue.map((a) => a.text), draft.trim()]
      : actionQueue.map((a) => a.text);

    if (allActions.length === 0) {
      setError("Enter your decree for this turn.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const result = await executeTurn(allActions);
      applyTurnResult(result, allActions);

      // Check for new crises after applying stats
      checkAndApplyCrises();

      // Try to compress history in background
      maybeCompressHistory().catch(() => {});

      // 30% chance for incoming diplomacy message
      if (Math.random() < 0.3) {
        const potentialNations = Object.keys(COUNTRIES).filter(
          (id) => id !== player.id,
        );
        const triggerId =
          potentialNations[Math.floor(Math.random() * potentialNations.length)];
        const nationData = COUNTRIES[triggerId];
        generateIncomingDiplo(triggerId, allActions[0]).then((text) => {
          if (text) {
            useDiploStore.getState().addIncoming({
              fromId: triggerId,
              fromName: nationData.name,
              fromFlag: nationData.flag,
              text,
              read: false,
              year,
              quarter,
            });
          }
        });
      }

      if (result.narrative && onConsequence) onConsequence(result.narrative);

      setDraft("");
      clearQueue();
      setTab("advisor");
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI call failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvise = () => {
    const text = draft.trim() || actionQueue.map((a) => a.text).join("; ");
    if (text) {
      setDraftAction(text);
      useUIStore.getState().setTab("advisor");
    }
  };

  const loadSuggestions = async () => {
    if (suggestions) {
      setShowSuggest((v) => !v);
      return;
    }
    setShowSuggest(true);
    setSuggestLoading(true);
    try {
      const s = await generateSuggestedActions();
      setSuggestions(s);
      setExpanded(new Set(["military"]));
    } catch {
      setError("Failed to generate suggestions");
    } finally {
      setSuggestLoading(false);
    }
  };

  const selectSuggestion = (text: string) => {
    addToQueue(text);
  };

  const toggleExpand = (cat: keyof SuggestedActions) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  if (!player) return null;

  const reserve = Math.floor(player.treasury);
  const revenue = Math.floor(player.gdp * 0.05 + player.trade * 0.03);
  const totalActions = actionQueue.length + (draft.trim() ? 1 : 0);

  return (
    <div className="flex-shrink-0 bg-card border-t border-border">
      {/* AI Suggestion Panel */}
      {showSuggest && (
        <div className="border-b border-border bg-background/50">
          {suggestLoading ? (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 size={12} className="animate-spin" />
              Generating action suggestions…
            </div>
          ) : suggestions ? (
            <div className="px-3 py-2">
              <p className="font-cinzel text-[8px] tracking-widest text-muted-foreground uppercase mb-2">
                ◆ AI-Suggested Actions — click to add to queue
              </p>
              {CATEGORY_LABELS.map((cat) => (
                <div key={cat} className="mb-1">
                  <button
                    onClick={() => toggleExpand(cat)}
                    className={`flex items-center gap-1 text-[9px] font-cinzel tracking-widest uppercase mb-1 ${CATEGORY_COLORS[cat]}`}
                  >
                    {expanded.has(cat) ? (
                      <ChevronDown size={10} />
                    ) : (
                      <ChevronRight size={10} />
                    )}
                    {cat}
                  </button>
                  {expanded.has(cat) && (
                    <div className="space-y-0.5 pl-3">
                      {suggestions[cat].map((s, i) => (
                        <button
                          key={i}
                          onClick={() => selectSuggestion(s)}
                          className="w-full text-left text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-sm hover:bg-muted/60 border border-transparent hover:border-border transition-colors font-garamond leading-snug"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* Action Queue */}
      {actionQueue.length > 0 && (
        <div className="px-3 pt-2 flex flex-wrap gap-1">
          {actionQueue.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-1 bg-muted/60 border border-border rounded-sm px-2 py-0.5 max-w-full"
            >
              <span className="text-[9px] font-mono-game text-muted-foreground">
                {idx + 1}.
              </span>
              <span className="text-[10px] font-garamond text-foreground truncate max-w-[240px]">
                {item.text}
              </span>
              <button
                onClick={() => removeFromQueue(item.id)}
                className="text-muted-foreground hover:text-destructive ml-0.5"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main input row */}
      <div className="p-3">
        <div className="flex justify-between items-baseline mb-1.5">
          <label className="block font-cinzel text-[8px] tracking-[0.2em] text-muted-foreground uppercase">
            ◆ {getPlayerDisplayName()} — {year} Q{quarter} — Your decree
          </label>
          <div className="flex gap-3">
            <span className="text-[9px] font-mono-game text-amber-500">
              ₤{reserve}B
            </span>
            <span className="text-[9px] font-mono-game text-green-500">
              +₤{revenue}B
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder={
                actionQueue.length > 0
                  ? "Add another action… (Shift+Enter to queue, Ctrl+Enter to execute all)"
                  : "Describe your strategy… (Shift+Enter to queue multiple actions, Ctrl+Enter to execute)"
              }
              rows={1}
              className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm font-garamond text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none leading-relaxed disabled:opacity-60 overflow-hidden"
              style={{ minHeight: "40px" }}
            />
          </div>

          <div className="flex flex-col gap-1">
            {/* Add to queue */}
            <button
              onClick={addDraftToQueue}
              disabled={loading || !draft.trim()}
              title="Add to queue (Shift+Enter)"
              className="border border-border text-muted-foreground font-cinzel text-[9px] tracking-widest px-2 py-1.5 rounded-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={12} />
            </button>
            {/* AI suggest */}
            <button
              onClick={loadSuggestions}
              disabled={loading}
              title="AI-suggested actions"
              className={`border font-cinzel text-[9px] tracking-widest px-2 py-1.5 rounded-sm transition-colors disabled:opacity-40 ${showSuggest ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
            >
              <Wand2 size={12} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={handleExecute}
            disabled={loading || totalActions === 0}
            className="flex-1 bg-primary text-primary-foreground font-cinzel text-[9px] tracking-widest px-4 py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? "⟳ Processing…"
              : totalActions > 1
                ? `▶ EXECUTE ${totalActions} ACTIONS`
                : "▶ EXECUTE"}
          </button>
          <button
            onClick={handleAdvise}
            disabled={loading || totalActions === 0}
            className="border border-border text-muted-foreground font-cinzel text-[9px] tracking-widest px-4 py-2 rounded-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
          >
            ⚡ ADVISE
          </button>
        </div>

        {error && <p className="text-destructive text-xs mt-1.5">{error}</p>}
        <p className="text-[8px] text-muted-foreground mt-1">
          Shift+Enter → queue · Ctrl+Enter → execute all
        </p>
      </div>
    </div>
  );
}
