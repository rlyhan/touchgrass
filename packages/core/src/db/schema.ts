import { sql } from "drizzle-orm"
import {
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import type { BFASScores } from "@touchgrass/types"

import { user } from "./auth-schema.js"

export * from "./auth-schema.js"

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  authUserId: text("auth_user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  birthdate: date("birthdate").notNull(),
  heightCm: integer("height_cm").notNull(),
  gender: text("gender"),
  build: text("build"),
  location: text("location").notNull(),
  employment: text("employment"),
  interests: text("interests")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  personality: jsonb("personality").$type<BFASScores>().notNull(),
  motivations: text("motivations")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
