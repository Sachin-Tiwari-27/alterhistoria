import { useGameStore } from "@/store/gameStore";
import type { PlayerNation, TurnResult } from "@/types";
import { COUNTRIES } from "@/data/countries";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Core caller ─────────────────────────────────────────────────────────────

const PRIMARY_MODEL = "openrouter/hunter-alpha";
const FALLBACK_MODEL = "arcee-ai/trinity-mini:free";

async function callOpenRouter(
  model: string,
  system: string,
  messages: AIMessage[],
  maxTokens: number,
  apiKey: string,
): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://alterhistoria.game",
      "X-Title": "Alter Historia",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  const data = await res.json();
  if (data.error)
    throw new Error(data.error.message ?? `OpenRouter error (${model})`);
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error(`Empty response from ${model}`);
  return text;
}

export async function callAI(
  system: string,
  messages: AIMessage[],
  maxTokens = 900,
): Promise<string> {
  const apiKey = useGameStore.getState().apiKey;
  if (!apiKey)
    throw new Error(
      "No API key set. Please add your OpenRouter key in Settings.",
    );
  try {
    return await callOpenRouter(
      PRIMARY_MODEL,
      system,
      messages,
      maxTokens,
      apiKey,
    );
  } catch (primaryErr) {
    console.warn(`[AI] Primary model failed (${PRIMARY_MODEL}):`, primaryErr);
    try {
      return await callOpenRouter(
        FALLBACK_MODEL,
        system,
        messages,
        maxTokens,
        apiKey,
      );
    } catch (fallbackErr) {
      console.error(
        `[AI] Fallback model also failed (${FALLBACK_MODEL}):`,
        fallbackErr,
      );
      throw new Error(
        `AI unavailable. Primary: ${(primaryErr as Error).message}. Fallback: ${(fallbackErr as Error).message}`,
      );
    }
  }
}

// ─── Compact nation identity block (~60 tokens vs old ~200) ──────────────────

export function buildNationIdentity(player: PlayerNation): string {
  const name = player.customName ?? player.name;
  const polity = player.customPolity ?? player.polity;
  const capital = player.customCapital ?? player.capital;
  const flag = player.customFlag ?? player.flag;
  const desc = player.customDescription ?? player.context;
  const recentLore = player.lore.at(-1) ?? "";
  return `NATION: ${flag} ${name} | ${polity.replace(/_/g, " ")} | ${capital}
IDENTITY: ${desc}
RECENT LORE: ${recentLore}`;
}

// ─── Compressed history helpers ───────────────────────────────────────────────

const COMPRESS_EVERY = 5;

export async function maybeCompressHistory(): Promise<void> {
  const { turn, actions, compressedHistory, setCompressedHistory } =
    useGameStore.getState();
  const lastAt = compressedHistory?.asOfTurn ?? 0;
  const newOnes = turn - lastAt;
  if (newOnes < COMPRESS_EVERY) return;
  const toCompress = actions.slice(0, actions.length - 2);
  if (toCompress.length === 0) return;
  const lines = toCompress
    .map((a) => `${a.year}Q${a.quarter}: ${a.action}`)
    .join(" | ");
  try {
    const summary = await callAI(
      "Summarise these player actions in exactly 2 sentences. Be specific and terse. No preamble.",
      [{ role: "user", content: lines }],
      120,
    );
    setCompressedHistory({
      summary: summary.trim(),
      asOfTurn: turn,
      rawAfter: actions.slice(-2),
    });
  } catch {
    /* non-critical */
  }
}

function buildHistoryContext(): string {
  const { compressedHistory, actions } = useGameStore.getState();
  if (compressedHistory) {
    const recent = compressedHistory.rawAfter
      .map((a) => `${a.year}Q${a.quarter}: ${a.action}`)
      .join(" | ");
    return `HISTORY: ${compressedHistory.summary}${recent ? ` | RECENT: ${recent}` : ""}`;
  }
  const recent = actions
    .slice(-3)
    .map((a) => `${a.year}Q${a.quarter}: ${a.action}`)
    .join(" | ");
  return recent ? `RECENT ACTIONS: ${recent}` : "RECENT ACTIONS: none";
}

// ─── Turn processor ───────────────────────────────────────────────────────────

export function buildTurnSystemPrompt(): string {
  const { player, year, quarter, divergence, nations, activeCrises } =
    useGameStore.getState();
  if (!player) return "";
  const friendNames =
    player.friends
      .slice(0, 6)
      .map((id) => nations[id]?.name ?? id)
      .join(", ") || "none";
  const foeNames =
    player.foes
      .slice(0, 6)
      .map((id) => nations[id]?.name ?? id)
      .join(", ") || "none";
  const reserve = Math.floor(player.treasury);
  const revenue = Math.floor(player.gdp * 0.05 + player.trade * 0.03);
  const crisisNote =
    activeCrises.length > 0
      ? `\nACTIVE CRISES: ${activeCrises.map((c) => `${c.title}(${c.turnsRemaining}t)`).join(", ")}`
      : "";

  return `You are the narrator-engine of Alter Historia, an alternate history grand strategy game (1920+).

${buildNationIdentity(player)}

YEAR: ${year} Q${quarter} | DIVERGENCE: ${divergence}pts
STATS: GDP:${player.gdp} HDI:${player.hdi} Mil:${player.military} Stab:${player.stability} Tech:${player.tech} Free:${player.freedom} Dem:${player.democracy} Trade:${player.trade} Pop:${player.population}M
BUDGET: Reserve:₤${reserve}B | Revenue:+₤${revenue}B/qtr
ALLIES: ${friendNames} | RIVALS: ${foeNames}
${buildHistoryContext()}${crisisNote}

RULES:
- BUDGET: Expensive actions must return budgetCost. Low reserve → narrate financial strain.
- STATS: stability<25→domestic unrest; military<15→enemies probe; treasury<5→austerity.
- CRISES: Address active crises or worsen their stat penalties.
- INDEPENDENCE/PARTITION: Use "transfers" to move GDP+pop from coloniser to new nation. For composite territories (British India = ISO 356+586+050+104; French Indochina = 704+116+418; Dutch East Indies = 360), liberate ALL member ISOs, not just one.
- Player custom identity ALWAYS overrides historical defaults.
- Return ONLY valid JSON, no markdown fences.

JSON schema:
{"narrative":"3-4 vivid sentences","statChanges":{"gdp":0,"hdi":0,"military":0,"stability":0,"tech":0,"freedom":0,"democracy":0,"trade":0,"population":0,"treasury":0},"worldEvents":[{"text":"...","type":"world|diplomatic|military|economic|social|crisis"}],"newFriends":[],"newFoes":[],"removeFoes":[],"occupations":{},"liberations":[],"transfers":[{"fromId":"...","toId":"...","stats":{"gdp":0,"population":0}}],"budgetCost":0,"divergenceDelta":10,"ticker":"Punchy headline <12 words","resolvedCrises":[]}`;
}

export async function executeTurn(actions: string[]): Promise<TurnResult> {
  const { year, quarter } = useGameStore.getState();
  const system = buildTurnSystemPrompt();
  const actionText =
    actions.length === 1
      ? actions[0]
      : actions.map((a, i) => `${i + 1}. ${a}`).join("\n");
  const raw = await callAI(
    system,
    [
      {
        role: "user",
        content: `Player actions for ${year} Q${quarter}:\n${actionText}\n\nSimulate bold alternate-history consequences.`,
      },
    ],
    1000,
  );
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI returned invalid JSON");
  const parsed = JSON.parse(match[0]);
  return {
    narrative: parsed.narrative ?? "",
    statChanges: parsed.statChanges ?? {},
    worldEvents: (parsed.worldEvents ?? []).map(
      (e: { text: string; type: string }) => ({
        text: e.text,
        type: e.type ?? "world",
      }),
    ),
    newFriends: parsed.newFriends ?? [],
    newFoes: parsed.newFoes ?? [],
    removeFoes: parsed.removeFoes ?? [],
    occupations: parsed.occupations ?? {},
    liberations: parsed.liberations ?? [],
    transfers: parsed.transfers ?? [],
    budgetCost: parsed.budgetCost ?? 0,
    divergenceDelta: parsed.divergenceDelta ?? 10,
    ticker: parsed.ticker ?? "",
    resolvedCrises: parsed.resolvedCrises ?? [],
  };
}

// ─── Advisor ──────────────────────────────────────────────────────────────────

export function buildAdvisorSystemPrompt(): string {
  const { player, year, divergence, nations, activeCrises } =
    useGameStore.getState();
  if (!player) return "";
  const friendNames =
    player.friends
      .slice(0, 5)
      .map((id) => nations[id]?.name ?? id)
      .join(", ") || "none";
  const foeNames =
    player.foes
      .slice(0, 5)
      .map((id) => nations[id]?.name ?? id)
      .join(", ") || "none";
  const crisisNote =
    activeCrises.length > 0
      ? `\nURGENT CRISES: ${activeCrises.map((c) => c.title).join(", ")}`
      : "";
  return `You are the Chief Advisor to ${player.customName ?? player.name}, a ${(player.customPolity ?? player.polity).replace(/_/g, " ")}, in ${year}.

${buildNationIdentity(player)}
Stats: GDP:${player.gdp} Mil:${player.military} Stab:${player.stability} Treasury:₤${Math.floor(player.treasury)}B
Allies: ${friendNames} | Rivals: ${foeNames} | Divergence: ${divergence}pts
${buildHistoryContext()}${crisisNote}

Give sharp, historically-grounded counsel in ≤150 words. Be direct — no hedging.`;
}

export function trimAdvisorHistory(
  msgs: AIMessage[],
  keepLast = 6,
): AIMessage[] {
  return msgs.length <= keepLast ? msgs : msgs.slice(-keepLast);
}

// ─── Advisor quick-action buttons ─────────────────────────────────────────────

export async function generateGameSummary(): Promise<string> {
  const { player, year, divergence, actions } = useGameStore.getState();
  if (!player) return "";
  const recentActions = actions
    .slice(-5)
    .map((a) => `${a.year}Q${a.quarter}: ${a.action}`)
    .join(" | ");
  return callAI(
    "You are a historian summarising an alternate timeline. Be vivid and specific. Max 200 words.",
    [
      {
        role: "user",
        content: `Summarise the game for ${player.customName ?? player.name} in ${year}. Divergence: ${divergence}pts. Turns: ${actions.length}. Recent: ${recentActions}. Stats: GDP:${player.gdp} Mil:${player.military} Stab:${player.stability}.`,
      },
    ],
    280,
  );
}

export async function generateStrategicAdvice(): Promise<string> {
  return callAI(
    buildAdvisorSystemPrompt(),
    [
      {
        role: "user",
        content:
          "Give me your top 3 strategic priorities right now, each in 2 sentences.",
      },
    ],
    300,
  );
}

export async function generateBestCourseOfAction(): Promise<string> {
  const { player } = useGameStore.getState();
  const name = player?.customName ?? player?.name ?? "your nation";
  return callAI(
    buildAdvisorSystemPrompt(),
    [
      {
        role: "user",
        content: `What single decree should I issue this turn for maximum impact? Give me the exact wording to enter as my action for ${name}, then explain why in 2 sentences.`,
      },
    ],
    250,
  );
}

// ─── AI-suggested actions ─────────────────────────────────────────────────────

export interface SuggestedActions {
  military: string[];
  economic: string[];
  diplomatic: string[];
  social: string[];
}

export async function generateSuggestedActions(): Promise<SuggestedActions> {
  const { player, year } = useGameStore.getState();
  if (!player)
    return { military: [], economic: [], diplomatic: [], social: [] };
  const name = player.customName ?? player.name;
  const raw = await callAI(
    `You are a strategy advisor for ${name} in ${year}. Return ONLY valid JSON, no markdown.`,
    [
      {
        role: "user",
        content: `Stats: GDP:${player.gdp} Mil:${player.military} Stab:${player.stability} HDI:${player.hdi} Treasury:₤${Math.floor(player.treasury)}B. ${buildHistoryContext()}\n\nGenerate 3 concrete, specific, actionable decrees per category.\nJSON: {"military":["...","...","..."],"economic":["...","...","..."],"diplomatic":["...","...","..."],"social":["...","...","..."]}`,
      },
    ],
    600,
  );
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return { military: [], economic: [], diplomatic: [], social: [] };
  try {
    return JSON.parse(match[0]);
  } catch {
    return { military: [], economic: [], diplomatic: [], social: [] };
  }
}

// ─── Diplomacy ────────────────────────────────────────────────────────────────

export function buildDiplomacySystemPrompt(
  targetId: string,
  targetName: string,
  targetContext: string,
  isGroup: boolean,
  groupMemberNames: string[],
): string {
  const { player, year, divergence } = useGameStore.getState();
  if (!player) return "";
  const playerName = player.customName ?? player.name;
  const rel = player.foes.includes(targetId)
    ? "hostile"
    : player.friends.includes(targetId)
      ? "friendly"
      : "neutral";
  const groupNote = isGroup
    ? `Multilateral channel also including: ${groupMemberNames.join(", ")}.`
    : "";
  return `You are head of government of ${targetName} in ${year}. Corresponding with ${playerName}.
Context: ${targetContext}
Relationship: ${rel} | Their stats: GDP:${player.gdp} Mil:${player.military} | Divergence: ${divergence}pts
${groupNote}
Stay in character as a 1920s statesman. Max 120 words.`;
}

// ─── Time Jump ────────────────────────────────────────────────────────────────

export function buildTimeJumpSystemPrompt(
  targetYear: number,
  milestones: string,
): string {
  const { player, year, divergence, nations } = useGameStore.getState();
  if (!player) return "";
  const playerName = player.customName ?? player.name;
  const friendNames =
    player.friends
      .slice(0, 5)
      .map((id) => nations[id]?.name ?? id)
      .join(", ") || "none";
  const foeNames =
    player.foes
      .slice(0, 5)
      .map((id) => nations[id]?.name ?? id)
      .join(", ") || "none";
  return `You are a historian narrating an alternate timeline. ${divergence} pts divergence.

${buildNationIdentity(player)}
Stats: GDP:${player.gdp} Mil:${player.military} Stab:${player.stability} HDI:${player.hdi}
Allies: ${friendNames} | Rivals: ${foeNames}
${buildHistoryContext()}
Real events ${year}→${targetYear}: ${milestones}

Write 5 vivid paragraphs about ${playerName} in ${targetYear}: (1) how choices changed history, (2) nation's triumphs/struggles, (3) how wider world diverged, (4) new alliances/conflicts, (5) near future.`;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export async function generateAltEvents(): Promise<
  Array<{ text: string; type: string }>
> {
  const { player, year, divergence } = useGameStore.getState();
  if (!player) return [];
  try {
    const raw = await callAI(
      `Generate 3 plausible world events for ${player.customName ?? player.name} in ${year} (divergence: ${divergence}pts). Return JSON array only: [{"text":"...","type":"world|military|diplomatic|social|economic"}]`,
      [{ role: "user", content: "Generate." }],
      400,
    );
    const match = raw.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}

export async function generateIncomingDiplo(
  triggerId: string,
  playerAction: string,
): Promise<string> {
  const { player, nations } = useGameStore.getState();
  if (!player) return "";
  const target = nations[triggerId] ?? COUNTRIES[triggerId];
  if (!target) return "";
  try {
    return await callAI(
      buildDiplomacySystemPrompt(
        triggerId,
        target.name,
        target.context,
        false,
        [],
      ),
      [
        {
          role: "user",
          content: `React to the player's recent action: "${playerAction}". Send a diplomatic dispatch.`,
        },
      ],
      350,
    );
  } catch {
    return "";
  }
}
