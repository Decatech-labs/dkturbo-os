FROM node:24.19.0-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable \
  && corepack prepare pnpm@11.21.0 --activate

WORKDIR /app


FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/control-plane/package.json packages/control-plane/package.json
COPY packages/design-system/package.json packages/design-system/package.json

RUN pnpm install --frozen-lockfile


FROM dependencies AS builder

COPY . .

RUN pnpm build


FROM dependencies AS runtime

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openssh-client \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app /app

CMD ["pnpm", "--filter", "@dkturbo/web", "start"]
