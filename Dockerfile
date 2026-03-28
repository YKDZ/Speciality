FROM node:24-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# ── Build stage ──
FROM base AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build the application
RUN pnpm build

# ── Production stage ──
FROM base AS production
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/dist ./dist
COPY --from=build /app/database ./database

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=/app/data/recipes.db

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "./dist/server/index.mjs"]
