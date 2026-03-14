# Alter Historia

### Rewrite the Century

An AI-powered alternate history grand strategy game set in 1920. Pick any nation, issue decrees each turn, and watch the AI simulate realistic geopolitical consequences as your timeline diverges from real history.

---

## What is this?

Alter Historia lets you lead any nation from 1920 onward. Every turn you type a decree — a policy, war declaration, alliance, revolution, economic reform — and the AI simulates how the world reacts. Your choices accumulate into a diverging alternate timeline tracked by a **Divergence Score**.

---

## Features

- 🌍 **Interactive D3 world map** — zoomable, pannable, click any country to open diplomacy
- 🏛️ **80+ playable nations** — all with authentic 1920 historical context, stats, and relationships
- 🤖 **AI-powered turn engine** — simulates realistic geopolitical consequences for every decree
- 🗣️ **Chief Advisor chat** — context-aware strategic counsel based on your history and world events
- 🤝 **Multilateral diplomacy** — open channels with any nation, form named coalition groups
- ✏️ **Nation identity editor** — rename your country, change polity, flag, capital, map colour
- 🗺️ **1920s territorial map** — colonial empires, occupations, and protectorates accurately reflected
- 📰 **News ticker** — live dispatches from your alternate world
- 📜 **Events log** — full history of world events categorised by type
- ⏩ **Time Jump** — simulate your alternate timeline to any year up to 1980
- 🌙 **Dark / light theme** — toggle with the top-right icon
- 💾 **Auto-save** — game state persists in localStorage between sessions
- ⌨️ **Keyboard shortcuts** — `[` / `]` to toggle left/right panels

---

## Tech Stack

| Layer     | Library                                  |
| --------- | ---------------------------------------- |
| Framework | React 18 + TypeScript                    |
| Build     | Vite 5                                   |
| Styling   | Tailwind CSS 3                           |
| State     | Zustand + Immer + Persist                |
| Map       | D3 + TopoJSON (Natural Earth projection) |
| Fonts     | Cinzel, EB Garamond, Share Tech Mono     |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/yourname/alterhistoria.git
cd alterhistoria
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. API Key (optional but recommended)

Connect a free [OpenRouter](https://openrouter.ai) API key for the full AI experience. Sign up and get a key at openrouter.ai — no credit card required.

Paste it into the game when prompted on launch. Without a key the game still loads, but AI features (turn simulation, advisor, diplomacy, time jump) will be unavailable.

---

## Project Structure

```
src/
├── components/
│   ├── layout/          # TopBar, TickerBar, ThemeToggle
│   ├── map/             # WorldMap, MapLegend, MapTooltip
│   ├── panels/          # StatsPanel, StatBar, RelationTags, RightPanel
│   ├── advisor/         # AdvisorChat
│   ├── diplomacy/       # DiploChannel, GroupManager, NationSearch
│   ├── events/          # EventFeed
│   ├── timejump/        # TimeJump
│   ├── nation-select/   # NationSelectOverlay, NationCard, NationPreview
│   ├── polity/          # PolityEditor
│   ├── ui/              # Button, Input, Badge (shared primitives)
│   ├── ActionBox.tsx    # Decree input bar
│   ├── ApiKeyModal.tsx  # Opening API key screen
│   └── ...
├── data/
│   ├── countries.ts     # 80+ nations with 1920 historical context
│   └── historicalEvents.ts
├── store/
│   ├── gameStore.ts     # Main game state (Zustand + Immer + persist)
│   ├── uiStore.ts       # Theme, active tab, Time Jump state, overlay visibility
│   └── diploStore.ts    # Diplomacy channels and saved groups
├── lib/
│   ├── ai.ts            # Core AI caller + all prompt builders
│   ├── mapColors.ts     # Pure colour calculation functions
│   └── utils.ts         # Shared helpers
├── types/
│   └── index.ts         # All TypeScript interfaces
├── App.tsx
├── main.tsx
└── index.css            # Tailwind + CSS variable theme system
```

---

## How to Play

### Selecting your nation

On launch you'll be asked for an optional API key, then dropped into the nation picker. Browse 80+ nations filtered by region. Click any nation to see its 1920 profile — stats, historical context, starting allies and rivals.

### Reshaping your nation

After selecting, click **Edit Nation Identity** in the left panel to:

- Rename your country (e.g. "Bharat" instead of "India")
- Change its form of government
- Set a custom flag emoji and map colour
- Write custom lore — the AI will honour all of this in every interaction

### Taking turns

Type your decree in the bottom bar and click **Execute**. The AI will:

- Narrate the consequences in 3-4 vivid sentences
- Adjust your nation's stats (GDP, military, stability, etc.)
- Generate world events and breaking news
- Update your allies and rivals
- Simulate territorial occupations or liberations if relevant
- Add to your Divergence Score

Use **Advise** to pass your draft decree to your Chief Advisor for strategic feedback before committing.

### Diplomacy

Click any country on the map to open a diplomatic channel with it. You can:

- Add multiple nations to the same channel for multilateral talks
- Save named groups (e.g. "Himalayan Bloc", "Asian Tariff Union")
- Each nation responds in character as a 1920s statesman

### Time Jump

Switch to the **Time Jump** tab. Pick a target year using the decade presets or the slider. The AI will write a 5-paragraph alternate history narrative describing what your world looks like by that year — accounting for all your past decisions.

---

## Building for Production

```bash
npm run build
npm run preview
```

Output is in `dist/` — a fully static site you can deploy anywhere (Vercel, Netlify, GitHub Pages, etc.).

---

## Environment Notes

- No `.env` file needed — the API key is entered in-game and stored in `localStorage`
- The game works offline except for AI features and the map TopoJSON (loaded from CDN)
- All game state auto-saves to `localStorage`

---

## Roadmap

- [ ] Economic trade network visualisation
- [ ] Military conflict simulation with battle outcomes
- [ ] Sound effects and ambient music
- [ ] Mobile responsive layout
- [ ] Export / import save files
- [ ] Multiplayer (multiple players, different nations)

---

## License

MIT
