import { useGameStore } from "@/store/gameStore";

interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function callAI(
  system: string,
  messages: AIMessage[],
  maxTokens = 800,
): Promise<string> {
  const apiKey = useGameStore.getState().apiKey;

  if (apiKey) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://alterhistoria.game",
        "X-Title": "Alter Historia",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        max_tokens: maxTokens,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content ?? "";
  }

  // Fallback: Anthropic built-in (works inside Claude.ai)
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

// Build turn prompt from game state
export function buildTurnSystemPrompt(): string {
  const { player, year, quarter, divergence, actions } =
    useGameStore.getState();
  if (!player) return "";

  const displayName = player.customName || player.name;
  const polity = player.customPolity || player.polity;
  const capital = player.customCapital || player.capital;

  return `You are the narrator-engine of Alter Historia, an alternate history grand strategy game.

NATION: ${displayName} (${polity}, capital: ${capital})
YEAR: ${year} Q${quarter}
STATS: GDP:${player.gdp} HDI:${player.hdi} Military:${player.military} Stability:${player.stability} Tech:${player.tech} Freedom:${player.freedom} Democracy:${player.democracy} Trade:${player.trade} Population:${player.population}M
FRIENDS: ${player.friends.join(", ") || "none"}
FOES: ${player.foes.join(", ") || "none"}
DIVERGENCE: ${divergence} pts from real history
LORE SO FAR: ${player.lore.slice(-3).join(" | ")}
RECENT ACTIONS: ${actions
    .slice(-4)
    .map((a) => `${a.year}Q${a.q}: ${a.action}`)
    .join(" | ")}

The player's nation may have a custom name, polity, or identity that differs from its real historical counterpart. Honour these changes in all narrative.

Respond ONLY with valid JSON matching the TurnResult schema:
{
  "narrative": "3-4 vivid sentences",
  "statChanges": {"gdp":0,"hdi":0,"military":0,"stability":0,"tech":0,"freedom":0,"democracy":0,"trade":0,"population":0},
  "worldEvents": [{"year":${year},"quarter":${quarter},"text":"...","type":"world|diplomatic|military|economic|social"}],
  "newFriends": [],
  "newFoes": [],
  "removeFoes": [],
  "divergenceDelta": 10,
  "ticker": "Short punchy headline"
}`;
}

export function buildAdvisorSystemPrompt(): string {
  const { player, year, divergence } = useGameStore.getState();
  if (!player) return "";
  const displayName = player.customName || player.name;
  const polity = player.customPolity || player.polity;
  return `You are the Chief Advisor to the leader of ${displayName}, a ${polity}. Year: ${year}. Divergence from real history: ${divergence} pts. Nation lore: ${player.lore.slice(-2).join(" ")}. Give direct, strategic counsel in under 160 words. Honour the player's chosen national identity at all times.`;
}

export function buildDiplomacySystemPrompt(
  targetId: string,
  targetName: string,
  targetContext: string,
  isGroup: boolean,
  groupMembers: string[],
): string {
  const { player, year, divergence } = useGameStore.getState();
  if (!player) return "";
  const displayName = player.customName || player.name;
  const rel = player.foes.includes(targetId)
    ? "hostile"
    : player.friends.includes(targetId)
      ? "friendly"
      : "neutral";

  const groupNote = isGroup
    ? `This is a multilateral summit also including: ${groupMembers.join(", ")}. Address all parties.`
    : "";

  return `You are the head of government of ${targetName} in ${year}. You are in diplomatic contact with ${displayName}. Your relationship: ${rel}. Context: ${targetContext}. Divergence: ${divergence} pts. ${groupNote} Stay in character as a 1920s statesman. Max 120 words.`;
}
