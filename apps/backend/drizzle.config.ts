import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  driver: "d1-http",
  dbCredentials: {
    databaseId: process.env.DATABASE_ID || "unknown-chat-dev",
    token: process.env.CLOUDFLARE_API_TOKEN || "",
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
  },
})
