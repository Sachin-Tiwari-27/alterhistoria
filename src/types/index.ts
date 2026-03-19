export type Polity =
  | "republic"
  | "monarchy"
  | "empire"
  | "federation"
  | "theocracy"
  | "communist_state"
  | "military_junta"
  | "democracy"
  | "sultanate"
  | "tribal_confederation";

export type Region = "Europe" | "Asia" | "Americas" | "Africa" | "Oceania";

export type EventType =
  | "world"
  | "diplomatic"
  | "military"
  | "economic"
  | "social"
  | "crisis";

export type StatThresholdLevel = "critical" | "warning" | "safe";

export interface NationStats {
  gdp: number;
  hdi: number;
  freedom: number;
  democracy: number;
  population: number;
  military: number;
  trade: number;
  stability: number;
  tech: number;
  treasury: number; // Persistent budget/wealth
}

export interface CountryBase extends NationStats {
  id: string;
  name: string;
  flag: string;
  region: Region;
  capital: string;
  polity: Polity;
  color: string;
  friends: string[];
  foes: string[];
  context: string;
  budgetMultiplier: number; // Historical economic power factor (1.0 = base)
}

export interface PlayerNation extends CountryBase {
  customName?: string;
  customPolity?: Polity;
  customFlag?: string;
  customCapital?: string;
  customDescription?: string;
  customColor?: string;
  lore: string[];
}

export interface TurnAction {
  year: number;
  quarter: number;
  action: string;
}

export interface WorldEvent {
  id: string;
  year: number;
  quarter: number;
  text: string;
  type: EventType;
  source?: "real" | "alt"; // 'alt' = generated in alternate timeline
}

export interface ActionRecord {
  id: string;
  year: number;
  quarter: number;
  action: string;
  narrative: string;
  events: string[];
  statDeltas: Partial<NationStats>;
}

// ─── Action Queue (multi-action support) ──────────────────────────────────────
export interface QueuedAction {
  id: string;
  text: string;
}

// ─── History compression ──────────────────────────────────────────────────────
export interface CompressedHistory {
  summary: string; // 2-3 sentence AI-generated memo of past turns
  asOfTurn: number; // turn number when this was last compressed
  rawAfter: TurnAction[]; // any new actions since last compression (kept raw)
}

// ─── Crisis events ────────────────────────────────────────────────────────────
export type CrisisType =
  | "civil_unrest"
  | "coup_attempt"
  | "famine"
  | "bankruptcy"
  | "invasion_threat"
  | "revolution";

export interface ActiveCrisis {
  id: string;
  type: CrisisType;
  title: string;
  description: string;
  turnsRemaining: number; // 0 = resolves this turn if unaddressed
  triggeredYear: number;
  triggeredQuarter: number;
  penaltyIfIgnored: Partial<NationStats>;
}

// ─── Stat threshold config (used for colouring bars and triggering crises) ────
export interface StatThreshold {
  critical: number; // below this = red / crisis eligible
  warning: number; // below this = amber
}

export const STAT_THRESHOLDS: Record<
  keyof Omit<NationStats, "population" | "treasury">,
  StatThreshold
> = {
  stability: { critical: 25, warning: 45 },
  military: { critical: 15, warning: 30 },
  gdp: { critical: 10, warning: 25 },
  hdi: { critical: 15, warning: 30 },
  freedom: { critical: 10, warning: 20 },
  democracy: { critical: 10, warning: 20 },
  trade: { critical: 10, warning: 20 },
  tech: { critical: 10, warning: 22 },
};

export function getStatLevel(
  key: keyof NationStats,
  value: number,
): StatThresholdLevel {
  const t = STAT_THRESHOLDS[key as keyof typeof STAT_THRESHOLDS];
  if (!t) return "safe";
  if (value < t.critical) return "critical";
  if (value < t.warning) return "warning";
  return "safe";
}

export interface IncomingMessage {
  id: string;
  fromId: string;
  fromName: string;
  fromFlag: string;
  text: string;
  read: boolean;
  year: number;
  quarter: number;
}

export interface DiploMessage {
  id: string;
  from: string;
  fromName: string;
  text: string;
  timestamp: number;
}

export interface DiploGroup {
  id: string;
  name: string;
  nationIds: string[];
  createdAt: number;
}

export interface TurnResult {
  narrative: string;
  statChanges: Partial<NationStats>;
  worldEvents: Array<{ text: string; type: EventType }>;
  newFriends: string[];
  newFoes: string[];
  removeFoes: string[];
  occupations: Record<string, string>;
  liberations: string[];
  divergenceDelta: number;
  ticker: string;
  transfers?: Array<{
    fromId: string;
    toId: string;
    stats: Partial<NationStats>;
  }>;
  budgetCost?: number;
  resolvedCrises?: string[];
}

export const POLITY_LABELS: Record<
  Polity,
  { label: string; description: string }
> = {
  republic: { label: "Republic", description: "Elected civilian government" },
  democracy: {
    label: "Parliamentary Democracy",
    description: "Multi-party elected parliament",
  },
  monarchy: {
    label: "Constitutional Monarchy",
    description: "King reigns, cabinet governs",
  },
  empire: {
    label: "Empire",
    description: "Imperial rule, expansionist ideology",
  },
  federation: {
    label: "Federation",
    description: "Decentralised union of states",
  },
  theocracy: { label: "Theocracy", description: "Religious authority governs" },
  communist_state: {
    label: "Communist State",
    description: "Party-led planned economy",
  },
  military_junta: {
    label: "Military Junta",
    description: "Armed forces control government",
  },
  sultanate: { label: "Sultanate", description: "Hereditary Islamic monarchy" },
  tribal_confederation: {
    label: "Tribal Confederation",
    description: "Alliance of autonomous tribes",
  },
};
