# Alter Historia

### Rewrite the Century

An AI-powered alternate history grand strategy game set in 1920. Pick any nation, issue decrees each turn, and watch the AI simulate realistic geopolitical consequences as your timeline diverges from real history.

---

## What is this?

Alter Historia lets you lead any nation from 1920 onward. Every turn you type a decree — a policy, war declaration, alliance, revolution, economic reform — and the AI simulates how the world reacts. Your choices accumulate into a diverging alternate timeline tracked by a **Divergence Score**.

Inspired by [Pax Historia](https://paxhistoria.com) (YC W2026).

---

## Features

- 🌍 **Interactive D3 world map** — zoomable, pannable, click any country to open diplomacy
- 🏛️ **60+ playable nations** — all with authentic 1920 historical context, stats, and relationships
- 🤖 **AI-powered turn engine** — DeepSeek R1 (free) via OpenRouter simulates consequences
- 🗣️ **Chief Advisor chat** — ask strategic questions between turns
- 🤝 **Multilateral diplomacy** — open channels with any nation, form named coalition groups
- ✏️ **Nation identity editor** — rename your country, change polity, flag, capital, map colour
- 📰 **News ticker** — live dispatches from your alternate world
- 📜 **Events log** — full history of world events categorised by type
- ⏩ **Time Jump** — simulate your alternate timeline to any year up to 1980
- 🌙 **Dark / light theme** — imperial midnight or aged parchment
- 💾 **Auto-save** — game state persists in localStorage between sessions

---

## Tech Stack

| Layer     | Library                                                |
| --------- | ------------------------------------------------------ |
| Framework | React 18 + TypeScript                                  |
| Build     | Vite 5                                                 |
| Styling   | Tailwind CSS 3                                         |
| State     | Zustand + Immer                                        |
| Map       | D3 + TopoJSON (Natural Earth)                          |
| AI        | OpenRouter API (DeepSeek R1 free) + Anthropic fallback |
| Fonts     | Cinzel, EB Garamond, Share Tech Mono                   |

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

### 3. Get a free OpenRouter API key

The game uses [DeepSeek R1](https://openrouter.ai/deepseek/deepseek-r1:free) via OpenRouter — it's completely free, no credit card required.

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up and create an API key
3. Paste it into the game when prompted on launch

> Without a key the game still runs but AI features (turn simulation, advisor, diplomacy) will not work.

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
│   ├── countries.ts     # 60+ nations with 1920 historical context
│   └── historicalEvents.ts
├── store/
│   ├── gameStore.ts     # Main game state (Zustand + Immer + persist)
│   ├── uiStore.ts       # Theme, active tab, overlay visibility
│   └── diploStore.ts    # Diplomacy channels and saved groups
├── hooks/
│   ├── useAI.ts         # React hooks wrapping AI calls
│   ├── useMap.ts        # Map colour and click logic
│   └── useTheme.ts      # Theme sync to <html> class
├── lib/
│   ├── ai.ts            # Core AI caller + all prompt builders
│   ├── mapColors.ts     # Pure colour calculation functions
│   └── utils.ts         # cn() and other helpers
├── types/
│   └── index.ts         # All TypeScript interfaces
├── App.tsx
├── main.tsx
└── index.css            # Tailwind + CSS variable theme system
```

---

## How to Play

### Selecting your nation

On launch you'll be asked for an API key, then dropped into the nation picker. Browse 60+ nations filtered by region. Click any nation to see its 1920 profile — stats, historical context, starting allies and rivals.

### Reshaping your nation

After selecting, click **Edit Nation Identity** in the left panel to:

- Rename your country (e.g. "Bharat" instead of "India")
- Change its form of government
- Set a custom flag emoji and map colour
- Write custom lore — the AI will honour all of this in every interaction

### Taking turns

Type your decree in the bottom bar and click **Execute**. The AI will:

- Narrate the consequences in 3-4 sentences
- Adjust your nation's stats
- Generate world events
- Update your allies and rivals
- Add to your Divergence Score

Use **Advise** to open the advisor without advancing the turn.

### Diplomacy

Click any country on the map to open a diplomatic channel with it. You can:

- Add multiple nations to the same channel for multilateral talks
- Save named groups (e.g. "Himalayan Bloc", "Asian Tariff Union")
- Each nation responds in character as a 1920s statesman

### Time Jump

Switch to the **Time Jump** tab and drag the slider to any year up to 1980. The AI will write a 5-paragraph alternate history narrative describing what your world looks like by that year.

---

## Building for Production

```bash
npm run build
npm run preview
```

Output is in `dist/` — a fully static site you can deploy anywhere.

---

## Environment Notes

- No `.env` file needed — the OpenRouter API key is entered in-game and stored in `localStorage`
- The game works offline except for AI features and the map TopoJSON (loaded from CDN)
- All game state auto-saves to `localStorage` under the key `alterhistoria-v2`

---

## Roadmap

- [ ] Economic trade network visualisation
- [ ] Military conflict simulation with battle outcomes
- [ ] More nations (target 170+)
- [ ] Sound effects and ambient music
- [ ] Mobile responsive layout
- [ ] Export / import save files
- [ ] Multiplayer (multiple players, different nations)

---

## License

MIT
