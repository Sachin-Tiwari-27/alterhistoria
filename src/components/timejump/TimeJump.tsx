import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { callAI, buildTimeJumpSystemPrompt } from "@/lib/ai";
import { getMilestonesForRange } from "@/data/historicalEvents";

export function TimeJump() {
  const [targetYear, setTargetYear] = useState(1940);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const player = useGameStore((s) => s.player);
  const year = useGameStore((s) => s.year);

  const progress = ((targetYear - 1921) / (1980 - 1921)) * 100;

  const simulate = async () => {
    if (!player) return;
    setError("");
    setLoading(true);
    setResult("");
    try {
      const milestones = getMilestonesForRange(year, targetYear);
      const system = buildTimeJumpSystemPrompt(targetYear, milestones);
      const reply = await callAI(
        system,
        [
          {
            role: "user",
            content: `Simulate the alternate timeline narrative from ${year} to ${targetYear}.`,
          },
        ],
        1200,
      );
      setResult(reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!player) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-xs text-muted-foreground italic text-center">
          Select a nation to simulate alternate futures.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
      <div>
        <p className="font-cinzel text-[9px] tracking-widest text-muted-foreground uppercase mb-1">
          Simulate Alternate Future
        </p>
        <p className="text-xs text-muted-foreground">
          Project your alternate timeline to any year between {year + 1} and
          1980.
        </p>
      </div>

      {/* Year display */}
      <div className="text-center">
        <div className="font-mono-game text-4xl text-primary font-bold tracking-widest">
          {targetYear}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {targetYear - year} years forward
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-1">
        <input
          type="range"
          min={year + 1}
          max={1980}
          value={targetYear}
          onChange={(e) => {
            setTargetYear(Number(e.target.value));
            setResult("");
          }}
          className="w-full accent-amber-500 cursor-pointer"
        />
        <div className="flex justify-between text-[9px] font-mono-game text-muted-foreground">
          <span>{year + 1}</span>
          <span>1950</span>
          <span>1980</span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Key milestones hint */}
      <div className="text-[9px] text-muted-foreground bg-muted/30 border border-border rounded-sm p-2">
        <span className="font-cinzel tracking-wide uppercase">
          Real history:{" "}
        </span>
        {getMilestonesForRange(year, Math.min(targetYear, year + 5))
          .split(";")[0]
          .replace(/^\d{4}-?\d*:?\s*/, "")}
        …
      </div>

      <button
        onClick={simulate}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground font-cinzel text-xs tracking-widest py-3 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "⟳ Simulating…" : `⏩ SIMULATE ${targetYear}`}
      </button>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {result && (
        <div className="border border-border rounded-sm bg-muted/20 p-3">
          <div className="font-cinzel text-[9px] tracking-widest text-primary uppercase mb-2">
            {targetYear} — Alternate Timeline
          </div>
          <div className="text-xs leading-relaxed text-foreground space-y-2">
            {result.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
