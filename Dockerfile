FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    CI=true
RUN corepack enable && corepack prepare pnpm@latest --activate

# ── Fetch dependencies (lockfile-only layer, maximises cache hits) ──
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch

# ── Build stage ──
FROM deps AS builder
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++ \
    && pnpm install --offline --frozen-lockfile \
    && pnpm build

# ── Production dependencies (runs in parallel with builder) ──
FROM deps AS prod-deps
WORKDIR /app
COPY package.json ./
RUN apk add --no-cache python3 make g++ \
    && pnpm install --offline --frozen-lockfile --prod

# ── Production stage ──
FROM node:24-alpine AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_URL=/app/data/recipes.db \
    UPLOAD_DIR=./data/uploads \
    REVIEWS_ENABLED=true \
    FALLBACK_LOCALE=zh-CN \
    HIDE_LANGUAGE_SWITCHER=false \
    FORCE_FALLBACK_LOCALE=false \
    MAX_FILE_SIZE=52428800 \
    TITLE=HRecipe

WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/database/migrations ./database/migrations
COPY --from=builder /app/database/seed.ts ./database/migrations/seed.ts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/locales ./

RUN mkdir -p /app/data

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

EXPOSE 3000

CMD ["node", "dist/server/index.mjs"]
