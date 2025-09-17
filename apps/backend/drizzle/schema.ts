import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  nickname: text("nickname").notNull(),
  isAnonymous: integer("is_anonymous", { mode: "boolean" })
    .notNull()
    .default(true),
  createAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  lastActiveAt: integer("last_active_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export const rooms = sqliteTable(
  "rooms",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    isPrivate: integer("is_Private", { mode: "boolean" })
      .notNull()
      .default(false),
    maxUsers: integer("max_users").default(50),
    createdBy: text("created_by").references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    nameIdx: index("rooms_name_idx").on(table.name),
  }),
)

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    roomId: text("room_id")
      .notNull()
      .references(() => rooms.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    content: text("content").notNull(),
    type: text("type").notNull().default("text"), // text, image,  file
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    roomIdIdx: index("messages_room_id_idx").on(table.roomId),
    timestampIdx: index("messages_timestamp_idx").on(table.createdAt),
    userIdIdx: index("messages_user_id_idx").on(table.userId),
  }),
)

export const userSessions = sqliteTable(
  "user_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    tokenIdx: index("sessions_token_idx").on(table.token),
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
  }),
)

export const roomParticipants = sqliteTable(
  "room_participants",
  {
    id: text("id").primaryKey(),
    roomId: text("room_id")
      .notNull()
      .references(() => rooms.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    joinedAt: integer("joined_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    leftAt: integer("left_at", { mode: "timestamp" }),
  },
  (table) => ({
    roomIdIdx: index("room_participants_room_id_idx").on(table.roomId),
    userIdIdx: index("room_participants_user_id_idx").on(table.userId),
  }),
)
