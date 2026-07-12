# Architecture

## Overview

This project is a full-stack restaurant review platform built as a **pnpm/Turborepo monorepo**. It consists of two independently deployable applications sharing a single PostgreSQL database.

```text
apps/
  api/     NestJS + Prisma — REST API and database owner
  web/     Next.js (App Router) — Hybrid-rendered SPA consuming the API

packages/
  types/   Shared enums (Cuisine, Role) generated from Prisma schema
```

Each application has its own `package.json`, TypeScript configuration, environment variables, and test suite. The only shared runtime package is `packages/types`, ensuring frontend and backend remain synchronized without sharing business logic.

---

# High-Level Architecture

```text
                     Browser
                        │
                        ▼
              Next.js (App Router)
                        │
                  HTTP REST API
                        │
                        ▼
                 NestJS Backend
                        │
                 Service Layer
                        │
                        ▼
                   Prisma ORM
                        │
                        ▼
                 PostgreSQL Database
```

The architecture intentionally separates:

- **Presentation layer** (Next.js)
- **Business logic** (NestJS services)
- **Persistence layer** (Prisma + PostgreSQL)

This keeps responsibilities well-defined and allows each application to evolve independently.

---

# Monorepo

The project uses **pnpm workspaces** and **Turborepo**.

Responsibilities:

- `apps/api`

  - REST API
  - Authentication
  - Business logic
  - Prisma
  - Database migrations

- `apps/web`

  - UI
  - Routing
  - Forms
  - Data fetching

- `packages/types`

  - Shared enums generated from Prisma
  - Prevents frontend/backend type drift
  - Does **not** expose the Prisma runtime

The Turborepo task graph ensures shared packages are built before dependent applications.

---

# Backend Architecture

The NestJS application follows a feature-based architecture.

```text
auth/
restaurants/
reviews/
users/
```

Each feature contains:

- Controller
- Service
- DTOs
- Guards
- Interfaces (where applicable)

Responsibilities are separated as follows:

- **Controllers** expose REST endpoints.
- **Services** contain business rules.
- **DTOs** validate incoming requests.
- **Guards** handle authentication and authorization.
- **Prisma** manages persistence.

Ownership validation is performed inside the service layer rather than guards because ownership depends on the requested resource.

---

# Frontend Architecture

The frontend uses the Next.js App Router with **Server Components by default**.

```text
app/
features/
components/
lib/
```

Responsibilities:

- `app/`

  - Route definitions
  - Server Components
  - Layouts

- `features/`

  - Restaurant
  - Review
  - Authentication

- `components/`

  - Reusable UI

- `lib/`

  - API client
  - Utilities

Feature-based organization keeps related code together and scales better than organizing by file type alone.

---

# Data Fetching

Restaurant listing and restaurant detail pages are rendered using **Server Components**.

Benefits:

- Faster initial render
- Better SEO
- Reduced client-side JavaScript
- Simpler data loading

Interactive functionality such as dialogs, forms, pagination controls, and filters are implemented as Client Components.

No client-side data fetching library is used.

---

# Database Design

The application consists of four primary models.

### User

Stores authentication information.

- Email (unique)
- Password hash (Argon2)
- Role (Reviewer or Owner)

Roles are selected during registration and remain immutable.

---

### Restaurant

Each restaurant belongs to exactly one owner.

Key fields include:

- Title
- Slug
- Cuisine
- Preview image
- Address
- City
- Description

Restaurant ratings are stored using two **denormalized** columns:

- `averageRating`
- `reviewCount`

These values are updated whenever reviews change, allowing the homepage to sort efficiently without recalculating aggregates on every request.

---

### Review

A review belongs to:

- one restaurant
- one reviewer

A unique constraint prevents duplicate reviews:

```text
@@unique([restaurantId, reviewerId])
```

Business rules ensure:

- only reviewers can create reviews
- users may only edit or delete their own reviews

---

### RefreshToken

Refresh tokens are stored separately from users.

This allows:

- multiple concurrent sessions
- per-device logout
- logout from all devices
- refresh token rotation

---

# Authentication

Authentication uses JWT access and refresh tokens stored as **HTTP-only cookies**.

Properties:

- Access Token

  - 15-minute lifetime
  - Signed using `JWT_SECRET`

- Refresh Token

  - 7-day lifetime
  - Signed using `JWT_REFRESH_SECRET`
  - Stored as an Argon2 hash in the database

Refresh tokens are rotated on every refresh request: a new session (new `jti`, new hashed token row) is created first, and only once that succeeds is the previous token's row deleted — both inside the same database transaction. Creating before deleting (rather than the reverse) means a crash mid-rotation leaves the user with a still-valid session instead of zero valid sessions.

This reduces the impact of stolen refresh tokens, since a stolen token stops working the moment the legitimate client refreshes.

---

# Authorization

Two roles are supported:

- Reviewer
- Owner

Authorization is enforced using:

- `JwtAuthGuard`
- `RolesGuard`
- Resource ownership checks

Examples:

- Owners can only modify restaurants they own.
- Reviewers can only modify reviews they authored.

Authorization decisions are always enforced on the backend.

---

# Security

The application includes several security measures.

- Argon2 password hashing
- HTTP-only cookies (`secure` in production, `sameSite: lax`)
- Refresh token rotation
- Resource ownership validation
- DTO validation
- Whitelisted request payloads
- Rate limiting (global + stricter per-route limits on login/register)
- Duplicate review prevention
- Input sanitization through NestJS ValidationPipe
- `helmet()` security headers on the API; `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` set on the web app in `next.config.ts`
- CORS restricted to a single configured origin with credentials
- Remote image loading restricted to `https` hosts (`next.config.ts`) to close off common SSRF targets (e.g. cloud metadata endpoints) that are almost always served over plain `http`

Authentication endpoints are additionally protected using stricter rate limits to reduce brute-force attacks.

---

# API Design

The backend exposes a REST API under `/api`.

Global validation is configured using:

- `whitelist`
- `forbidNonWhitelisted`
- `transform`

Main resources:

### Authentication

- Register
- Login
- Current user
- Refresh session
- Logout
- Logout all sessions

### Restaurants

Supports:

- Listing
- Details
- Owner CRUD
- City lookup

Listing supports:

- Offset pagination
- City filter
- Cuisine filter
- Minimum rating filter
- Rating sorting

### Reviews

Supports:

- Listing
- Create
- Update
- Delete

Reviews use cursor pagination for efficient incremental loading.

---

# Pagination Strategy

Different resources use different pagination strategies.

## Restaurants

Uses **offset pagination**.

Reasons:

- Moderate dataset size
- Traditional page navigation
- Easy bookmarking
- Works naturally with filtering

---

## Reviews

Uses **cursor pagination**.

Reasons:

- Potentially unbounded growth
- "Load More" user experience
- Stable ordering
- Better performance for deep pagination

---

# Filtering and Sorting

Restaurant listings support:

- City
- Cuisine
- Minimum rating
- Rating sort order

The URL acts as the source of truth while navigating the application.

To satisfy the assignment requirement that filtering and sorting persist across visits, the selected filter state is also stored in `localStorage` and restored when visiting the application without query parameters.

---

# Shared Types

The Prisma schema generates:

- Prisma Client
- Shared enums

Only `Cuisine` and `Role` are exported through `packages/types`.

This prevents frontend/backend drift while avoiding bundling the Prisma runtime into the Next.js application.

Changing an enum in `schema.prisma` automatically updates:

- Database schema
- API validation
- Frontend forms
- Filters
- Shared TypeScript types

---

# Error Handling

The API returns appropriate HTTP status codes.

Examples:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict

On the frontend, Next.js error boundaries (`error.tsx`, `global-error.tsx`, and `not-found.tsx`) provide graceful recovery for unexpected failures.

---

# Testing

Each application maintains an independent test suite.

API tests cover:

- Services
- Controllers
- Guards

using mocked Prisma clients.

Frontend tests cover:

- Components
- User interactions
- `features/*/api/*` data-fetching functions (request shape, success parsing, and error propagation)

using React Testing Library and mocked `fetch`.

A lightweight end-to-end smoke test verifies that the NestJS application boots successfully and serves requests.

---

# Design Decisions

## Next.js App Router

Chosen for hybrid rendering, Server Components, and excellent routing support.

## NestJS

Provides a modular architecture, dependency injection, and strong TypeScript support.

## Prisma

Offers type-safe database access and migration management.

## Feature-Based Folder Structure

Keeps related business logic together, improving maintainability as the application grows.

## Denormalized Ratings

Restaurant ratings are stored instead of calculated on every request to optimize sorting and listing performance.

---

# Deployment

The two applications are deployed independently, each auto-deploying from `main` via its platform's native GitHub integration — no separate CI pipeline runs the deploys.

- **`apps/api`** → [Render](https://render.com), configured as code in [`render.yaml`](./render.yaml) (a Render Blueprint).
- **`apps/web`** → [Vercel](https://vercel.com), with the project's Root Directory set to `apps/web` and build/install commands pinned in [`apps/web/vercel.json`](./apps/web/vercel.json).
- **Database** → external managed Postgres (e.g. Neon), referenced via `DATABASE_URL` on the API service only. The web app never talks to Postgres directly.

## Why the build order matters

Both deploys have to account for `apps/api` being the source of truth for `packages/types`: the Prisma schema declares two generators (one for the API's own client, one for `packages/types`' enum-only client), so `prisma generate` must run — from `apps/api` — before `packages/types` builds, and `packages/types` must build before either app that imports it.

- **Render** (`render.yaml`): `pnpm --filter api exec prisma generate && pnpm --filter types build && pnpm --filter api build`.
- **Vercel** (`apps/web/vercel.json`): since Vercel's Root Directory is `apps/web`, the build command `cd`s back up to the repo root first, then runs the same `prisma generate` → build sequence scoped to `web` and its dependencies.

## Migrations on Render's free tier

Render's Pre-Deploy Command feature (the natural place to run `prisma migrate deploy`) isn't available on the free plan. Migrations instead run at the front of `startCommand`, immediately before `node dist/main`. `prisma migrate deploy` is a no-op when there's nothing pending, so this is safe on every boot — including the free tier's spin-down/wake cycle, which needs to pick up new migrations anyway.

## A build-output gotcha worth knowing

`apps/api/tsconfig.build.json` explicitly excludes `prisma.config.ts` and `prisma/` and pins `rootDir: "./src"`. Without that, TypeScript infers `rootDir` as the package root (since `prisma.config.ts` lives outside `src/`), and `nest build` nests output under `dist/src/main.js` instead of `dist/main.js` — which breaks `node dist/main` at deploy time with no compile error to point at the cause. `prisma.config.ts` doesn't need compiling anyway; Prisma's CLI loads it directly from source.

## Environment variables

| Service      | Variable                                   | Notes                                                                                                                 |
| ------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| API (Render) | `DATABASE_URL`                             | External Postgres connection string                                                                                   |
| API (Render) | `JWT_SECRET`, `JWT_REFRESH_SECRET`         | Auto-generated by the Render Blueprint                                                                                |
| API (Render) | `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | `15m` / `7d`                                                                                                          |
| API (Render) | `WEB_URL`                                  | Single CORS origin — the Vercel production domain                                                                     |
| Web (Vercel) | `NEXT_PUBLIC_API_BASE_URL`                 | Render API URL, e.g. `https://<service>.onrender.com/api`                                                             |
| Web (Vercel) | `NEXT_PUBLIC_SITE_URL`                     | The Vercel production domain                                                                                          |
| Web (Vercel) | `DATABASE_URL`                             | Placeholder only — needed for `prisma generate` to resolve `env("DATABASE_URL")` during the build; never connected to |

`WEB_URL` being a single origin means Vercel _preview_ deployments (per-PR URLs) are not in the API's CORS allowlist — only the pinned production domain is. Preview builds of `apps/web` can't successfully call the deployed API until this is widened to a pattern or list.

---

# Trade-offs

Several implementation decisions were made intentionally to keep the project focused on the assignment.

- Preview images are stored as URLs instead of implementing file uploads.
- Addresses are entered manually rather than integrating Google Places.
- Restaurants use offset pagination, while reviews use cursor pagination.
- Shared types are limited to enums to avoid coupling the frontend to the Prisma runtime.
- Server Components are used wherever possible to reduce client-side JavaScript while keeping interactive features isolated to Client Components.
