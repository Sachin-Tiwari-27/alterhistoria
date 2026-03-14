import { useGameStore } from "@/store/gameStore";
import type { PlayerNation, TurnResult } from "@/types";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Core caller ────────────────────────────────────────────────────────────

const PRIMARY_MODEL  = 'openrouter/hunter-alpha'
const FALLBACK_MODEL = 'arcee-ai/trinity-mini:free'

async function callOpenRouter(
  model: string,
  system: string,
  messages: AIMessage[],
  maxTokens: number,
  apiKey: string,
): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://alterhistoria.game',
      'X-Title': 'Alter Historia',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message ?? `OpenRouter error (${model})`)
  const text = data.choices?.[0]?.message?.content ?? ''
  if (!text) throw new Error(`Empty response from ${model}`)
  return text
}

export async function callAI(
  system: string,
  messages: AIMessage[],
  maxTokens = 900,
): Promise<string> {
  const apiKey = useGameStore.getState().apiKey
  if (!apiKey) throw new Error('No API key set. Please add your OpenRouter key in Settings.')

  try {
    return await callOpenRouter(PRIMARY_MODEL, system, messages, maxTokens, apiKey)
  } catch (primaryErr) {
    console.warn(`[AI] Primary model failed (${PRIMARY_MODEL}):`, primaryErr)
    try {
      return await callOpenRouter(FALLBACK_MODEL, system, messages, maxTokens, apiKey)
    } catch (fallbackErr) {
      console.error(`[AI] Fallback model also failed (${FALLBACK_MODEL}):`, fallbackErr)
      throw new Error(`AI unavailable. Primary: ${(primaryErr as Error).message}. Fallback: ${(fallbackErr as Error).message}`)
    }
  }
}

// ─── Nation identity block (used in every prompt) ───────────────────────────

export function buildNationIdentity(player: PlayerNation): string {
  const name = player.customName ?? player.name;
  const polity = player.customPolity ?? player.polity;
  const capital = player.customCapital ?? player.capital;
  const flag = player.customFlag ?? player.flag;
  const desc = player.customDescription ?? player.context;
  const lore = player.lore.slice(-3).join(" → ");

  return `NATION: ${flag} ${name} | POLITY: ${polity.replace(/_/g, " ")} | CAPITAL: ${capital}
IDENTITY: ${desc}
ACCUMULATED LORE: ${lore}`;
}

// ─── Turn processor ─────────────────────────────────────────────────────────

export function buildTurnSystemPrompt(): string {
  const { player, year, quarter, divergence, actions, nations } =
    useGameStore.getState();
  if (!player) return "";

  const friendNames =
    player.friends.map((id) => nations[id]?.name ?? id).join(", ") || "none";
  const foeNames =
    player.foes.map((id) => nations[id]?.name ?? id).join(", ") || "none";
  const recentActions =
    actions
      .slice(-4)
      .map((a) => `${a.year}Q${a.quarter}: ${a.action}`)
      .join(" | ") || "none";

    const budget = Math.floor((player.gdp * 0.25) + (player.trade * 0.15))
  const talent = Math.floor(player.hdi * 1.2)

  return `You are the narrator-engine of Alter Historia, an alternate history grand strategy game starting in 1920.

${buildNationIdentity(player)}

YEAR: ${year} Q${quarter}
STATS: GDP:${player.gdp} HDI:${player.hdi} Military:${player.military} Stability:${player.stability} Tech:${player.tech} Freedom:${player.freedom} Democracy:${player.democracy} Trade:${player.trade} Population:${player.population}M
CONSTRAINTS: Current Budget: ₤${budget}B | Talent Pool (HDI): ${talent}
ALLIES: ${friendNames}
RIVALS: ${foeNames}
DIVERGENCE FROM REAL HISTORY: ${divergence} pts
RECENT PLAYER ACTIONS: ${recentActions}

Rules:
- BUDGET: Expensive decrees (war, major industrialization, massive social programs) cost budget. If the player's budget is low, simulate financial strain, debt, or underfunded failures in your narrative.
- TALENT (HDI): High HDI acts as a multiplier for Tech and GDP progress. Low HDI (under 40) triggers "talent drain" or "brain drain" crises and makes complex reforms slower or more unstable.
- The player's custom name, polity, flag, and identity ALWAYS override the historical defaults. Never use the original nation name if a custom one is set.
- Simulate realistic but DRAMATIC alternate history consequences. Do not just maintain the status quo. Be bold and imaginative.
- Consider how neighbouring nations react, cascading geopolitical shocks, and what unintended consequences occur.
- Higher divergence = more alternate timeline freedom, wildcard events, and radical shifts in your narrative.
- Ensure narrative sentences are vivid, specific, and impactful.
- Return ONLY valid JSON — no markdown fences, no preamble, no trailing text.

JSON schema:
{
  "narrative": "3-4 vivid, specific sentences describing consequences",
  "statChanges": {"gdp":0,"hdi":0,"military":0,"stability":0,"tech":0,"freedom":0,"democracy":0,"trade":0,"population":0},
  "worldEvents": [{"text":"event description","type":"world|diplomatic|military|economic|social"}],
  "newFriends": [],
  "newFoes": [],
  "removeFoes": [],
  "occupations": {}, 
  "liberations": [],
  "divergenceDelta": 10,
  "ticker": "Short punchy news headline under 12 words"
}

For occupations: populate as '"occupations": { "targetNationId": "occupierNationId" }' when a territory is conquered or annexed.
For liberations: populate as '"liberations": ["targetNationId"]' if a previously occupied territory gains independence.`;
}

export async function executeTurn(action: string): Promise<TurnResult> {
  const { year, quarter } = useGameStore.getState();
  const system = buildTurnSystemPrompt();
  const raw = await callAI(
    system,
    [
      {
        role: "user",
        content: `Player action for ${year} Q${quarter}: ${action}\n\nSimulate realistic but bold consequences. Consider: 1) How does this fundamentally diverge from real history? 2) How do neighbouring nations and great powers react to this disruption? 3) What dramatic unintended consequences occur? Push the boundaries of alternate history if divergence is high.`,
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
    divergenceDelta: parsed.divergenceDelta ?? 10,
    ticker: parsed.ticker ?? "",
  };
}

// ─── Advisor ────────────────────────────────────────────────────────────────

export function buildAdvisorSystemPrompt(): string {
  const { player, year, divergence, nations, actions, events } =
    useGameStore.getState();
  if (!player) return "";

  const friendNames =
    player.friends.map((id) => nations[id]?.name ?? id).join(", ") || "none";
  const foeNames =
    player.foes.map((id) => nations[id]?.name ?? id).join(", ") || "none";

  const recentActions =
    actions
      .slice(-5)
      .map((a) => `${a.year}Q${a.quarter}: ${a.action}`)
      .join(" | ") || "none";
  const recentEvents =
    events
      .slice(0, 5)
      .map((e) => `${e.year}Q${e.quarter}: ${e.text}`)
      .join(" | ") || "none";

  return `You are the Chief Advisor and Foreign Secretary to the leader of ${player.customName ?? player.name}, a ${(player.customPolity ?? player.polity).replace(/_/g, " ")}, in the year ${year}.

${buildNationIdentity(player)}

Current allies: ${friendNames}
Current rivals: ${foeNames}
Divergence from real history: ${divergence} pts
Recent Actions taken by you: ${recentActions}
Recent World Events: ${recentEvents}

Your role: Give sharp, specific, historically-grounded strategic counsel. You are aware this is an alternate timeline. The player may ask for general advice, or ask you to review a proposed decree. When reviewing a decree, analyse its risks, benefits, and geopolitical consequences based on recent world events and past actions. Always address the player's nation by its custom name if set. Be direct and authoritative — no hedging. Maximum 160 words per response.`;
}

// ─── Diplomacy ──────────────────────────────────────────────────────────────

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
    ? `This is a MULTILATERAL diplomatic channel also including: ${groupMemberNames.join(", ")}. Address all parties appropriately.`
    : "";

  const playerStats = `Their nation stats — GDP:${player.gdp} Military:${player.military} Stability:${player.stability}`;

  return `You are the head of government of ${targetName} in ${year}. You are engaged in diplomatic correspondence with ${playerName}.

Your nation's context: ${targetContext}
Your relationship with ${playerName}: ${rel}
${playerStats}
Divergence from real history: ${divergence} pts
${groupNote}

Stay strictly in character as a statesman of this era and nation. React authentically to the diplomatic approach — be guarded if hostile, warm if friendly, calculated if neutral. Reference real geopolitical concerns of your nation in ${year}. Maximum 120 words.`;
}

// ─── Time Jump ──────────────────────────────────────────────────────────────

export function buildTimeJumpSystemPrompt(
  targetYear: number,
  milestones: string,
): string {
  const { player, year, divergence, actions, nations } =
    useGameStore.getState();
  if (!player) return "";

  const playerName = player.customName ?? player.name;
  const friendNames =
    player.friends.map((id) => nations[id]?.name ?? id).join(", ") || "none";
  const foeNames =
    player.foes.map((id) => nations[id]?.name ?? id).join(", ") || "none";
  const actionSummary =
    actions.map((a) => `${a.year}Q${a.quarter}: ${a.action}`).join(" | ") ||
    "none";

  return `You are a historian narrating an alternate timeline. The player's choices have created ${divergence} points of divergence from real history.

${buildNationIdentity(player)}
Current stats: GDP:${player.gdp} HDI:${player.hdi} Military:${player.military} Freedom:${player.freedom} Democracy:${player.democracy}
Allies: ${friendNames} | Rivals: ${foeNames}
All player actions taken (${year} to present): ${actionSummary}

Projecting from ${year} to ${targetYear}.
Real historical events that occurred between these years: ${milestones}

Write a 5-paragraph vivid alternate history narrative describing what ${playerName} and the world look like in ${targetYear}. Be highly creative and bold — name specific events, brilliant or disastrous leaders, and dramatic consequences. Show: (1) How the player's choices radically changed historical outcomes, (2) What the nation looks like now (its triumphs and struggles), (3) How the wider world has diverged into a deeply altered state, (4) What new, surprising alliances and conflicts define the era, (5) What the near future holds in this timeline. Reference the player's custom identity throughout.`;
}
