import { useState, useRef, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import {
  callAI,
  buildAdvisorSystemPrompt,
  trimAdvisorHistory,
  generateGameSummary,
  generateStrategicAdvice,
  generateBestCourseOfAction,
} from "@/lib/ai";
import type { AIMessage } from "@/lib/ai";
import { Loader2 } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

type QuickAction = "summary" | "strategy" | "bestMove";
const QUICK_ACTIONS: { id: QuickAction; label: string }[] = [
  { id: "summary", label: "Game Summary" },
  { id: "strategy", label: "Strategic Advice" },
  { id: "bestMove", label: "Best Course of Action" },
];

export function AdvisorChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState<QuickAction | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const player = useGameStore((s) => s.player);
  const draftAction = useGameStore((s) => s.draftAction);
  const setDraftAction = useGameStore((s) => s.setDraftAction);
  const getPlayerDisplayName = useGameStore((s) => s.getPlayerDisplayName);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [input]);

  // Welcome message
  useEffect(() => {
    if (player && msgs.length === 0) {
      const name = player.customName ?? player.name;
      setMsgs([
        {
          role: "assistant",
          text: `Welcome, leader of ${name}.\n\n${player.customDescription ?? player.context}\n\nThe year is 1920. Your choices will forge an alternate timeline. What is your first order of business?`,
        },
      ]);
    }
  }, [player, msgs.length]);

  const send = async (overrideText?: string) => {
    const textToSubmit = overrideText ?? input.trim();
    if (!textToSubmit || loading || !player) return;
    if (!overrideText) setInput("");
    setMsgs((m) => [...m, { role: "user", text: textToSubmit }]);
    setLoading(true);
    try {
      // Trim history to last 6 messages to keep tokens low
      const history: AIMessage[] = trimAdvisorHistory(
        msgs.map((m) => ({ role: m.role, content: m.text })),
      );
      history.push({ role: "user", content: textToSubmit });
      const reply = await callAI(buildAdvisorSystemPrompt(), history, 500);
      setMsgs((m) => [...m, { role: "assistant", text: reply }]);
    } catch (e) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: `Error: ${e instanceof Error ? e.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (type: QuickAction) => {
    if (quickLoading || loading || !player) return;
    setQuickLoading(type);
    setMsgs((m) => [
      ...m,
      { role: "user", text: QUICK_ACTIONS.find((q) => q.id === type)!.label },
    ]);
    try {
      let reply = "";
      if (type === "summary") reply = await generateGameSummary();
      if (type === "strategy") reply = await generateStrategicAdvice();
      if (type === "bestMove") reply = await generateBestCourseOfAction();
      setMsgs((m) => [...m, { role: "assistant", text: reply }]);
    } catch (e) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: `Error: ${e instanceof Error ? e.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setQuickLoading(null);
    }
  };

  // Handle incoming draft actions from ActionBox
  useEffect(() => {
    if (draftAction && player) {
      const promptText = `Please review my proposed decree: "${draftAction}". Consider my past actions and suggest improvements or highlight risks.`;
      setDraftAction("");
      setTimeout(() => send(promptText), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftAction, player]);

  if (!player) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-xs text-muted-foreground italic text-center">
          Select a nation to receive counsel from your Chief Advisor.
        </p>
      </div>
    );
  }

  const isAnyLoading = loading || quickLoading !== null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex-shrink-0">
        <p className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase">
          ◆ Chief Advisor · {getPlayerDisplayName()}
        </p>

        {/* Quick action buttons */}
        <div className="flex gap-1 mt-2">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.id}
              onClick={() => handleQuickAction(qa.id)}
              disabled={isAnyLoading}
              className="flex-1 flex items-center justify-center gap-1 border border-border text-[8px] font-cinzel tracking-wider text-muted-foreground hover:border-primary hover:text-primary transition-colors py-1.5 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {quickLoading === qa.id ? (
                <Loader2 size={9} className="animate-spin" />
              ) : null}
              <span>{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-sm px-3 py-2 text-[11px] font-garamond leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary/10 text-foreground border border-primary/20 text-right"
                  : "bg-muted/60 text-foreground border border-border"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {(loading || quickLoading) && (
          <div className="flex justify-start">
            <div className="bg-muted/60 border border-border rounded-sm px-3 py-2">
              <Loader2
                size={12}
                className="animate-spin text-muted-foreground"
              />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={isAnyLoading}
            placeholder="Ask your advisor…"
            rows={1}
            className="flex-1 bg-input border border-border rounded-sm px-3 py-2 text-sm font-garamond text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none leading-relaxed disabled:opacity-60 overflow-hidden"
            style={{ minHeight: "36px" }}
          />
          <button
            onClick={() => send()}
            disabled={isAnyLoading || !input.trim()}
            className="bg-primary text-primary-foreground font-cinzel text-[9px] tracking-widest px-3 py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <p className="text-[8px] text-muted-foreground mt-1">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
