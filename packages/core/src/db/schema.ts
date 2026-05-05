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

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
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

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
