import { useState, useCallback } from "react";
import {
  callAI,
  executeTurn,
  buildAdvisorSystemPrompt,
  buildDiplomacySystemPrompt,
  buildTimeJumpSystemPrompt,
} from "@/lib/ai";
import type { AIMessage } from "@/lib/ai";
import type { TurnResult } from "@/types";

// ─── Turn execution ──────────────────────────────────────────────────────────

export function useTurn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (action: string | string[]): Promise<TurnResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const actions = Array.isArray(action) ? action : [action];
        const result = await executeTurn(actions);
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { execute, loading, error };
}

// ─── Advisor chat ────────────────────────────────────────────────────────────

export function useAdvisor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(
    async (history: AIMessage[]): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const system = buildAdvisorSystemPrompt();
        const reply = await callAI(system, history, 500);
        return reply;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { ask, loading, error };
}

// ─── Diplomacy ───────────────────────────────────────────────────────────────

export function useDiplomacy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (
      targetId: string,
      targetName: string,
      targetContext: string,
      history: AIMessage[],
      isGroup = false,
      groupMemberNames: string[] = [],
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const system = buildDiplomacySystemPrompt(
          targetId,
          targetName,
          targetContext,
          isGroup,
          groupMemberNames,
        );
        const reply = await callAI(system, history, 400);
        return reply;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { send, loading, error };
}

// ─── Time Jump ───────────────────────────────────────────────────────────────

export function useTimeJump() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulate = useCallback(
    async (targetYear: number, milestones: string): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const system = buildTimeJumpSystemPrompt(targetYear, milestones);
        const reply = await callAI(
          system,
          [
            {
              role: "user",
              content: `Simulate the alternate timeline narrative to ${targetYear}.`,
            },
          ],
          1200,
        );
        return reply;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { simulate, loading, error };
}
