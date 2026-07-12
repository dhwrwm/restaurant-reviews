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

## Deployment

- **API** → [Render](https://render.com), deployed from [`render.yaml`](./render.yaml) (Blueprint/IaC). Push to `main` and Render auto-builds and deploys.
- **Web** → [Vercel](https://vercel.com), project root set to `apps/web`; build/install commands are pinned in [`apps/web/vercel.json`](./apps/web/vercel.json) since the app depends on `packages/types`, which in turn depends on the Prisma schema in `apps/api`. Push to `main` and Vercel auto-builds and deploys.

Both platforms deploy straight from GitHub — no separate CI pipeline. See [ARCHITECTURE.md](./ARCHITECTURE.md#deployment) for the full build pipeline and required environment variables.
