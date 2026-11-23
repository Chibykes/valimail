# Valimail

Email validation web app. The browser talks to Next.js Route Handlers. Handlers call Reacher through a swappable adapter and store results in Postgres.

## Stack

- Next.js 15 (App Router) + Clerk
- Prisma 7 + PostgreSQL (`prisma.config.ts` + `@prisma/adapter-pg`)
- TanStack Query + Axios
- shadcn/ui + Tailwind
- Reacher (external) for SMTP, MX, and syntax checks

Images are built in GitHub Actions and pulled from GHCR. The VPS does not run `docker build`.

## Prerequisites

- Node 22+ and pnpm 11
- Docker with the Compose plugin
- Clerk app keys (linked app: `app_3MUsB9v0T5jroRHytkpUAokhPWA`)
- Reacher running somewhere the process can reach. Local default is `http://localhost:8080`. Inside Compose, use `http://host.docker.internal:8080` (or set `REACHER_DOCKER_URL`)

Reacher must be configured with `RCH__HEADER_SECRET`. Put that same value in `REACHER_HEADER_SECRET`. An empty secret makes every check return 400: `Missing request header "x-reacher-secret"`.

## Environment

Copy values into `.env` for Compose and `.env.local` for `pnpm dev`. Do not commit either file.

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Build + browser | Clerk client. Baked into the image at build time |
| `CLERK_SECRET_KEY` | Runtime | Clerk server |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Build | Default `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Build | Default `/sign-up` |
| `DATABASE_URL` | Runtime | Host dev: `localhost:5433`. Containers: rewritten to `postgres:5432` |
| `POSTGRES_USER` | Postgres | Default `valimail` |
| `POSTGRES_PASSWORD` | Postgres | Default `valimail` |
| `POSTGRES_DB` | Postgres | Default `valimail` |
| `POSTGRES_PORT` | Host publish | Default `5433`, bound to `127.0.0.1` |
| `REACHER_BASE_URL` | Host dev | Default `http://localhost:8080` |
| `REACHER_DOCKER_URL` | Compose app | Default `http://host.docker.internal:8080` |
| `REACHER_HEADER_SECRET` | Runtime | Must match Reacher `RCH__HEADER_SECRET` |
| `PORT` | Host publish | App port. Default `4455`, bound to `127.0.0.1` |

Changing a `NEXT_PUBLIC_*` value requires a new image build. Restarting the container is not enough.

## Local development

Postgres only, app on the host:

```bash
docker compose -f docker-compose.local.yml up -d postgres
pnpm install          # postinstall runs prisma generate → src/generated/prisma
pnpm exec prisma migrate dev
pnpm dev
```

App: [http://localhost:4455](http://localhost:4455)

`DATABASE_URL` on the host must use port **5433** (`127.0.0.1:5433`). Inside Compose the database is still `postgres:5432`.

## Docker

Two Compose files share the project name `valimail` and the volume `valimail_pg_data`.

| File | Use |
| --- | --- |
| `docker-compose.local.yml` | Build `runner` and `migrator` on this machine |
| `docker-compose.yml` | Pull `ghcr.io/chibykes/valimail/app` and `…/migrate` |

Dockerfile targets, sized for a 1 vCPU / 1 GB VPS:

| Target | Role |
| --- | --- |
| `runner` | Next.js standalone server on port 4455 |
| `migrator` | `prisma migrate deploy`, then exit |

`migrate` runs once and must finish before `app` starts. Health check: `GET /api/v1/health`.

Full stack on this machine:

```bash
docker compose -f docker-compose.local.yml up -d --build
docker compose -f docker-compose.local.yml ps
docker compose -f docker-compose.local.yml logs -f app
```

Production pull (after the first Actions build, or once `:latest` exists):

```bash
docker compose pull
docker compose up -d
```

Reacher is not part of this Compose file. If it runs on the same host, leave `REACHER_DOCKER_URL` unset. The app service adds `host.docker.internal`.

## Deploy

Workflow: [`.github/workflows/docker.yml`](.github/workflows/docker.yml).

On push to `main`, a `v*` tag, or a manual run:

1. Build `app` (`runner`) and `migrate` (`migrator`)
2. Push to `ghcr.io/chibykes/valimail/{app,migrate}`
3. On `main` or a `v*` tag, SSH to the VPS, `git pull`, `docker compose pull`, `up -d`

Images are tagged with the full git SHA, the branch, and `latest` on the default branch. Deploy uses the SHA.

### GitHub environment

Repo → **Settings → Environments → New environment** → name: `production`. The deploy job requires it.

### Secrets

| Secret | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Baked into the app image |
| `VPS_HOST` | VPS IP or hostname |
| `VPS_USER` | SSH user in the `docker` group |
| `VPS_SSH_KEY` | Private key for that user |
| `GHCR_PULL_TOKEN` | PAT with `read:packages`. Skip if the packages are public |

### Variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Baked into the image | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Baked into the image | `/sign-up` |
| `DEPLOY_PATH` | App directory on the VPS | `./valimail` |
| `VPS_SSH_PORT` | SSH port | `22` |

Set `DEPLOY_PATH` to the real clone path, for example `/opt/valimail`.

### VPS `.env`

Runtime only: `CLERK_SECRET_KEY`, `POSTGRES_*`, `REACHER_HEADER_SECRET`, and `REACHER_DOCKER_URL` if Reacher is not on that host. Compose overwrites `DATABASE_URL` to the `postgres` service.

Clerk Dashboard allowed origins and redirect URLs must include the public app URL. The process listens on **4455**, not 80. Put a reverse proxy on 80/443 in front of `127.0.0.1:4455` for a normal domain. Do not open 5433 to the internet.

### SSH key for Actions

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./gha_deploy -N ""
```

- Public key → VPS `~/.ssh/authorized_keys` for `VPS_USER`
- Private key → Actions secret `VPS_SSH_KEY`

## App routes

| Path | Purpose |
| --- | --- |
| `/` | Marketing landing + demo check |
| `/sign-in`, `/sign-up` | Clerk auth. Signed-in users go to `/dashboard` |
| `/dashboard` | Redirects to `/dashboard/lists` |
| `/dashboard/lists` | Paste or upload a list |
| `/dashboard/lists/[jobId]` | Bulk job progress, results, CSV export |
| `/dashboard/single` | Single email validation |
| `/api/v1/health` | Public liveness check. No auth |

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Next.js dev server on port 4455 |
| `pnpm build` | Production build (Turbopack). The image uses `next build` without Turbopack |
| `pnpm start` | Start a non-Docker production server |
| `pnpm db:generate` | Generate Prisma Client (`src/generated/prisma`) |
| `pnpm exec prisma migrate dev` | Apply migrations in development |
| `pnpm exec prisma studio` | Browse the database |

## Architecture

```
Browser → Axios + TanStack Query → /api/v1/* → Clerk auth
  → Services → EmailValidationAdapter (Reacher) + Prisma repositories
```

Docker:

```
GitHub Actions → GHCR app + migrate
VPS docker compose → migrate (once) → app :4455
                   → postgres :5432 (published on 127.0.0.1:5433)
app → Reacher on the host
```

Key folders:

- `src/constants` — env keys, routes, Reacher paths, query keys, statuses
- `src/adapters` — HTTP + email-validation interfaces + Reacher implementation
- `src/helpers` — `EmailHelper`, `CsvHelper`, `ReachableHelper`, `ApiErrorHelper`
- `src/repositories` — Prisma only
- `src/services` — orchestration
- `src/app/api/v1` — thin route handlers

## API

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/v1/health` | `{ ok: true }`. Public |
| `GET` | `/api/v1/check-email` | Recent checks for the signed-in user |
| `POST` | `/api/v1/check-email` | `?sync=1` uses Reacher v0. Default is v1 |
| `GET` | `/api/v1/bulk` | Lists for the signed-in user |
| `POST` | `/api/v1/bulk` | Body `{ emails: string[], name?: string }` |
| `GET` | `/api/v1/bulk/[jobId]` | Ownership check + status sync |
| `GET` | `/api/v1/bulk/[jobId]/results` | Ownership check + results |

## Clerk

Linked application: `app_3MUsB9v0T5jroRHytkpUAokhPWA` (ValiMail).

```bash
npx -y clerk@latest auth login
npx -y clerk@latest env pull --app app_3MUsB9v0T5jroRHytkpUAokhPWA
npx -y clerk@latest doctor
```

Sign-in and sign-up send the user to `/dashboard`.

## Out of scope

- Billing
- User API keys
