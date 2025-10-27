FROM node:20-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# lockfileとpackage.jsonだけコピーしてインストール
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

# 残りのソース
COPY . .

EXPOSE 3000
CMD ["pnpm", "dev"]
