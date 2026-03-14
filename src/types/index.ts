export type Polity =
  | 'republic' | 'monarchy' | 'empire' | 'federation'
  | 'theocracy' | 'communist_state' | 'military_junta'
  | 'democracy' | 'sultanate' | 'tribal_confederation'

export type Region = 'Europe' | 'Asia' | 'Americas' | 'Africa' | 'Oceania'

export type EventType = 'world' | 'diplomatic' | 'military' | 'economic' | 'social'

export interface NationStats {
  gdp: number
  hdi: number
  freedom: number
  democracy: number
  population: number
  military: number
  trade: number
  stability: number
  tech: number
}

export interface CountryBase extends NationStats {
  id: string
  name: string
  flag: string
  region: Region
  capital: string
  polity: Polity
  color: string
  friends: string[]
  foes: string[]
  context: string
}

export interface PlayerNation extends CountryBase {
  customName?: string
  customPolity?: Polity
  customFlag?: string
  customCapital?: string
  customDescription?: string
  customColor?: string
  lore: string[]
}

export interface TurnAction {
  year: number
  quarter: number
  action: string
}

export interface WorldEvent {
  id: string
  year: number
  quarter: number
  text: string
  type: EventType
  source?: 'real' | 'alt'  // 'alt' = generated in alternate timeline
}

export interface ActionRecord {
  id: string
  year: number
  quarter: number
  action: string
  narrative: string
  events: string[]
  statDeltas: Partial<NationStats>
}

export interface IncomingMessage {
  id: string
  fromId: string
  fromName: string
  fromFlag: string
  text: string
  read: boolean
  year: number
  quarter: number
}

export interface DiploMessage {
  id: string
  from: string
  fromName: string
  text: string
  timestamp: number
}

export interface DiploGroup {
  id: string
  name: string
  nationIds: string[]
  createdAt: number
}

export interface TurnResult {
  narrative: string
  statChanges: Partial<NationStats>
  worldEvents: Array<{ text: string; type: EventType }>
  newFriends: string[]
  newFoes: string[]
  removeFoes: string[]
  occupations: Record<string, string>
  liberations: string[]
  divergenceDelta: number
  ticker: string
}

export const POLITY_LABELS: Record<Polity, { label: string; description: string }> = {
  republic:              { label: 'Republic',                description: 'Elected civilian government' },
  democracy:             { label: 'Parliamentary Democracy', description: 'Multi-party elected parliament' },
  monarchy:              { label: 'Constitutional Monarchy', description: 'King reigns, cabinet governs' },
  empire:                { label: 'Empire',                  description: 'Imperial rule, expansionist ideology' },
  federation:            { label: 'Federation',              description: 'Decentralised union of states' },
  theocracy:             { label: 'Theocracy',               description: 'Religious authority governs' },
  communist_state:       { label: 'Communist State',         description: 'Party-led planned economy' },
  military_junta:        { label: 'Military Junta',          description: 'Armed forces control government' },
  sultanate:             { label: 'Sultanate',               description: 'Hereditary Islamic monarchy' },
  tribal_confederation:  { label: 'Tribal Confederation',    description: 'Alliance of autonomous tribes' },
}
