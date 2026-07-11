# Restaurant Reviews

A restaurant review platform: reviewers browse, filter, and review restaurants; restaurant owners manage their own listings.

## Structure

Turborepo + pnpm workspace.

```
apps/
  api/     NestJS + Prisma/Postgres API
  web/     Next.js (App Router) client
packages/
  types/   Cuisine/Role enums generated from apps/api/prisma/schema.prisma,
           shared by both apps so they can't drift out of sync
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system design — data model, auth flow, API surface, and key design decisions.

## Prerequisites

- Node (see `.nvmrc`)
- pnpm (see `packageManager` in `package.json`)
- A Postgres database

## Setup

```bash
pnpm install

cp apps/api/.env.example apps/api/.env      # fill in DATABASE_URL and JWT secrets
cp apps/web/.env.example apps/web/.env.local

pnpm db:migrate
pnpm db:seed    # optional: populates sample restaurants/reviews/users
                # (seed users' password: Password123!)
```

## Development

```bash
pnpm dev      # runs apps/api and apps/web together (also builds packages/types first)
```

- API: http://localhost:3001/api
- Web: http://localhost:3000

## Other scripts

```bash
pnpm build       # build all apps/packages
pnpm test        # run all test suites
pnpm lint        # lint all apps
pnpm typecheck   # tsc --noEmit for all apps
pnpm format      # prettier --write .

pnpm db:generate # regenerate the Prisma client (also runs implicitly by db:migrate)
pnpm db:migrate  # apply Prisma migrations
pnpm db:seed     # seed sample data
pnpm db:studio   # open Prisma Studio
```

Each app can also be run individually with `pnpm --filter api <script>` / `pnpm --filter web <script>`.
