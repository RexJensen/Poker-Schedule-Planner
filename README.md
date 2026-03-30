<h1 align="center">Poker Tournament Planner</h1>

<p align="center">
  <strong>Plan your summer 2026 Las Vegas poker grind.</strong><br/>
  Browse 290+ tournaments &middot; Filter &amp; search &middot; Build your schedule &middot; Track your budget
</p>

<p align="center">
  <a href="https://poker-schedule-planner.replit.app"><strong>Live App &rarr;</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/typescript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/express-5-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/postgresql-drizzle-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

## Overview

A mobile-first web app for browsing and planning summer 2026 Las Vegas poker tournament schedules. Star the events you want to play, combine filters to narrow down options, and see your total buy-in budget at a glance.

Covers three major series:

| Series | Events | Dates |
|--------|--------|-------|
| **WSOP** | 144 events | May 26 – Jul 15 |
| **Wynn Summer Classic** | 138 events | May 20 – Jul 13 |
| **Orleans Summer Open** | 9 Main Event flights | Jul 1 – Jul 5 |

## Features

- **Browse & scroll** — flat list layout with date/time sidebar, inspired by the official WSOP app
- **Filter by series** — WSOP, Wynn, Orleans, or all
- **Filter by game type** — NLH, PLO, Mixed, or all
- **Filter by buy-in** — preset ranges (multi-select) or enter a custom min/max
- **Search** — find events by name, format, or game type
- **Star tournaments** — tap the star to save events to your personal schedule
- **Budget tracker** — My List page shows total buy-ins and event count
- **Expandable details** — tap any row to see starting chips, blind levels, late reg, and format info
- **Dark theme** — casino-inspired aesthetic with deep greens and gold accents

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, Wouter |
| **State** | TanStack React Query, Orval-generated hooks |
| **Backend** | Express 5, Node.js |
| **Database** | PostgreSQL, Drizzle ORM |
| **API Contract** | OpenAPI 3.1, Orval codegen (React Query hooks + Zod schemas) |
| **Monorepo** | pnpm workspaces, TypeScript 5.9 composite projects |

## Project Structure

```
poker-tournament-planner/
├── artifacts/
│   ├── api-server/              # Express API server
│   │   └── src/
│   │       ├── data/            # Tournament data files
│   │       │   ├── wsop.ts      # 144 WSOP events
│   │       │   ├── wynn.ts      # 138 Wynn events
│   │       │   └── orleans.ts   # 9 Orleans ME flights
│   │       └── routes/          # API route handlers
│   └── poker-planner/           # React + Vite frontend
│       └── src/
│           ├── components/      # TournamentCard, FilterBar, BottomNav
│           ├── hooks/           # useTournamentsData
│           └── pages/           # Schedule, MyList
├── lib/
│   ├── api-spec/                # OpenAPI spec + Orval config
│   ├── api-client-react/        # Generated React Query hooks
│   ├── api-zod/                 # Generated Zod schemas
│   └── db/                      # Drizzle ORM schema + connection
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **PostgreSQL** database

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/poker-tournament-planner.git
cd poker-tournament-planner

# 2. Install dependencies
pnpm install

# 3. Configure environment
export DATABASE_URL="postgresql://user:password@localhost:5432/poker_planner"

# 4. Push database schema
pnpm --filter @workspace/db run push

# 5. Generate API client
pnpm --filter @workspace/api-spec run codegen
```

### Development

```bash
# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start frontend dev server
pnpm --filter @workspace/poker-planner run dev
```

### Production Build

```bash
pnpm run build
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tournaments` | List tournaments — query params: `series`, `date`, `minEntry`, `maxEntry`, `gameType` |
| `GET` | `/api/tournaments/my-list` | Get saved tournament IDs |
| `PUT` | `/api/tournaments/my-list` | Save tournament IDs — body: `{ "ids": ["id1", "id2"] }` |

## Adding a New Series

1. Create a data file in `artifacts/api-server/src/data/` following the `RawTournament` interface (see `wynn.ts` for reference)
2. Import and spread into `allTournaments` in `artifacts/api-server/src/routes/tournaments.ts`
3. Add the series name to the filter options in `artifacts/poker-planner/src/components/FilterBar.tsx`

## License

This project is licensed under the [MIT License](LICENSE).
