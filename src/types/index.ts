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

export type Region = "Asia" | "Americas" | "Africa" | "Europe" | "Oceania";

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
}

export interface CountryBase extends NationStats {
  id: string; // numeric TopoJSON ID e.g. "356"
  name: string; // real historical name
  flag: string;
  region: Region;
  capital: string;
  polity: Polity;
  color: string; // map fill hex
  friends: string[]; // nation IDs
  foes: string[];
  context: string; // 1920-era flavour text
}

export interface PlayerNation extends CountryBase {
  // Overrideable by player
  customName?: string; // e.g. "Bharat" instead of "India"
  customPolity?: Polity;
  customFlag?: string; // emoji or URL
  customCapital?: string;
  customDescription?: string;
  customColor?: string;
  lore: string[]; // accumulated narrative history
}

export interface TurnAction {
  year: number;
  quarter: number;
  action: string;
}

export interface WorldEvent {
  year: number;
  quarter: number;
  text: string;
  type: "world" | "diplomatic" | "military" | "economic" | "social";
}

export interface DiploMessage {
  from: string; // nation ID or 'player'
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
  worldEvents: WorldEvent[];
  newFriends: string[];
  newFoes: string[];
  removeFoes: string[];
  divergenceDelta: number;
  ticker: string;
}
