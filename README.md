# Valimail

Email validation web app. Browser talks to Next.js Route Handlers; handlers call Reacher via a swappable adapter and persist results in Postgres.

## Stack

- Next.js 15 (App Router) + Clerk
- Prisma 7 + PostgreSQL (Docker Compose, `prisma.config.ts` + `@prisma/adapter-pg`)
- TanStack Query + Axios
- shadcn/ui + Tailwind
- Reacher (external) for SMTP/MX/syntax checks

## Prerequisites

- Node 20+
- Docker (for Postgres)
- Clerk app keys (already linked if you ran `clerk init --app …`)
- Reacher running at `REACHER_BASE_URL` (default `http://localhost:8080`)

## Setup

```bash
cp .env.example .env.local
# Ensure Clerk keys are present (or: npx clerk@latest env pull)
# Add REACHER_BASE_URL / REACHER_HEADER_SECRET as needed

docker compose up -d
npm install          # postinstall runs prisma generate → src/generated/prisma
npx prisma migrate dev
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

## App routes

| Path | Purpose |
| --- | --- |
| `/` | Marketing landing + demo check |
| `/sign-in`, `/sign-up` | Clerk auth |
| `/dashboard` | Redirects to `/dashboard/single` |
| `/dashboard/single` | Single email validation |
| `/dashboard/lists` | Bulk upload |
| `/dashboard/lists/[jobId]` | Bulk job status + results |

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma Client (`src/generated/prisma`) |
| `npx prisma migrate dev` | Apply migrations (URL from `prisma.config.ts`) |
| `npx prisma studio` | Browse DB |

## Architecture

```
Browser → Axios + TanStack Query → /api/v1/* → Clerk auth
  → Services → EmailValidationAdapter (Reacher) + Prisma repositories
```

Key folders:

- `src/constants` — env keys, routes, Reacher paths, query keys, statuses
- `src/adapters` — HTTP + email-validation interfaces + Reacher impl (factory in `index.ts`)
- `src/helpers` — `EmailHelper`, `CsvHelper`, `ReachableHelper`, `ApiErrorHelper`
- `src/repositories` — Prisma only
- `src/services` — orchestration
- `src/app/api/v1` — thin route handlers

## API

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/v1/check-email` | `?sync=1` uses Reacher v0; default v1 |
| `POST` | `/api/v1/bulk` | Body `{ input: string[] }` |
| `GET` | `/api/v1/bulk/[jobId]` | Ownership check + status sync |
| `GET` | `/api/v1/bulk/[jobId]/results` | Ownership check + results |

## Clerk

This project is linked to Clerk application `app_3MUsB9v0T5jroRHytkpUAokhPWA` (ValiMail).

If CLI auth expires:

```bash
npx -y clerk@latest auth login
npx -y clerk@latest env pull --app app_3MUsB9v0T5jroRHytkpUAokhPWA
npx -y clerk@latest doctor
```

## Out of scope

- Billing
- User API keys
