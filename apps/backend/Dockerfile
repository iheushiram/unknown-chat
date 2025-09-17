FROM node:20-bookworm-slim

# wrangler / pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate \
  && npm i -g wrangler

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY . .

# Wrangler の互換日を wrangler.toml に入れておく:
# compatibility_date = "2025-09-13"

EXPOSE 8787
CMD ["pnpm", "dev"]
