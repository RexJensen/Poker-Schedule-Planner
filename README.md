# Poker Tournament Planner

A mobile-first web app for planning your summer 2026 Las Vegas poker tournament schedule. Browse events across multiple series, filter by game type and buy-in, star the tournaments you want to play, and track your total budget.

![Dark theme poker planner interface](https://img.shields.io/badge/mobile--first-dark%20theme-1a2e1a?style=for-the-badge)

## Features

- **Browse 290+ tournaments** across WSOP, Wynn Summer Classic, and Orleans Summer Open
- **Filter by series, game type, and buy-in range** — buy-in filters are multi-select so you can combine ranges
- **Custom buy-in range** — set any min/max dollar amount
- **Search** by event name, format, or game type
- **Star tournaments** to build your personal schedule
- **Budget tracker** — see your total buy-in cost and event count on the My List page
- **Expandable cards** — tap any event to see starting chips, blind levels, late registration, and format details
- **Mobile-first design** — dark casino aesthetic inspired by the official WSOP app

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion |
| Backend | Express 5, Node.js |
| Database | PostgreSQL, Drizzle ORM |
| API | OpenAPI 3.1 spec, Orval codegen (React Query hooks + Zod schemas) |
| Monorepo | pnpm workspaces, TypeScript 5.9 composite projects |

## Project Structure

```
├── artifacts/
│   ├── api-server/          # Express API server
│   │   └── src/
│   │       ├── data/        # Static tournament data (WSOP, Wynn, Orleans)
│   │       └── routes/      # API route handlers
│   └── poker-planner/       # React + Vite frontend
│       └── src/
│           ├── components/  # TournamentCard, FilterBar, BottomNav
│           ├── hooks/       # useTournamentsData (filters, saved list, budget)
│           └── pages/       # Schedule, MyList
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod validation schemas
│   └── db/                  # Drizzle ORM schema + database connection
└── scripts/                 # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
# DATABASE_URL is required for PostgreSQL connection
export DATABASE_URL="postgresql://user:password@localhost:5432/poker_planner"

# Push database schema
pnpm --filter @workspace/db run push

# Generate API client from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

### Development

```bash
# Start the API server (default port 8080)
pnpm --filter @workspace/api-server run dev

# Start the frontend dev server
pnpm --filter @workspace/poker-planner run dev
```

### Build

```bash
# Typecheck and build all packages
pnpm run build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tournaments` | List all tournaments (supports `series`, `date`, `minEntry`, `maxEntry`, `gameType` query params) |
| `GET` | `/api/tournaments/my-list` | Get saved tournament IDs |
| `PUT` | `/api/tournaments/my-list` | Update saved tournament IDs (`{ ids: string[] }`) |

## Tournament Data

Tournament schedules are defined as static TypeScript files in `artifacts/api-server/src/data/`:

- `wsop.ts` — 144 WSOP events (May 26 – Jul 15)
- `wynn.ts` — 138 Wynn Summer Classic events (May 20 – Jul 13)
- `orleans.ts` — 9 Orleans Summer Open Main Event flights (Jul 1 – Jul 5)

To add a new series, create a new data file following the `RawTournament` interface and import it in `artifacts/api-server/src/routes/tournaments.ts`.

## License

MIT
