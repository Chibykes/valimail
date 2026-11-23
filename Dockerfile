# syntax=docker/dockerfile:1.7
# Target: Ubuntu VPS, 1 vCPU, 1GB RAM (+swap). Cap heap, serialize work, keep runner tiny.

FROM node:22-bookworm-slim AS base

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@11.7.0 --activate

# 1 CPU: no parallel fetch/postinstall. Fetch timeouts for flaky VPS links.
ENV NEXT_TELEMETRY_DISABLED=1 \
  CI=1 \
  JOBS=1 \
  npm_config_jobs=1 \
  PNPM_FETCH_TIMEOUT=600000 \
  PNPM_FETCH_RETRIES=5 \
  PNPM_NETWORK_CONCURRENCY=2 \
  PNPM_CHILD_CONCURRENCY=1 \
  UV_THREADPOOL_SIZE=2

# --- deps ---
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma
# postinstall runs prisma generate. prisma.config.ts requires DATABASE_URL. Generate does not connect.
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile --child-concurrency=1 --network-concurrency=2

# --- build ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG DATABASE_NAME=valimail
ARG DATABASE_USER=valimail
ARG DATABASE_PASSWORD=valimail
ARG DATABASE_HOST=127.0.0.1
ARG DATABASE_PORT=5432

# NEXT_PUBLIC_* inlined at `next build`. .dockerignore strips .env, so pass keys here
# or the client bundle ships with empty Clerk config.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Heap 768: leave ~256MB for kernel + dockerd on a 1GB box. Do not raise.
ENV DATABASE_URL="postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}?schema=public" \
  NODE_OPTIONS="--max-old-space-size=768" \
  SKIP_TYPECHECK=1 \
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} \
  NEXT_PUBLIC_CLERK_SIGN_IN_URL=${NEXT_PUBLIC_CLERK_SIGN_IN_URL} \
  NEXT_PUBLIC_CLERK_SIGN_UP_URL=${NEXT_PUBLIC_CLERK_SIGN_UP_URL}

RUN pnpm exec prisma generate \
  && pnpm exec next build \
  && rm -rf .next/cache

# --- migrate (tiny; do not run the builder image) ---
FROM node:22-bookworm-slim AS migrator

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

RUN npm install --omit=dev --no-audit --no-fund \
  prisma@7.10.1 \
  dotenv@18.0.10 \
  && npm cache clean --force

ENV NODE_ENV=production \
  NODE_OPTIONS="--max-old-space-size=256" \
  PRISMA_HIDE_UPDATE_MESSAGE=1 \
  PATH="/app/node_modules/.bin:${PATH}"

COPY package.json prisma.config.ts ./
COPY prisma ./prisma

CMD ["prisma", "migrate", "deploy"]

# --- run ---
FROM node:22-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs \
  && chown nextjs:nodejs /app

# Heap 384: Next server. Leave room for postgres + OS.
ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  PORT=4455 \
  HOSTNAME=0.0.0.0 \
  NODE_OPTIONS="--max-old-space-size=384" \
  UV_THREADPOOL_SIZE=2 \
  PRISMA_HIDE_UPDATE_MESSAGE=1

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

USER nextjs
EXPOSE 4455

CMD ["node", "server.js"]
