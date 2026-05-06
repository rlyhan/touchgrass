import { eq } from "drizzle-orm"

import { db } from "./client.js"
import { type NewUser, type User, users } from "./schema.js"

export async function insertUser(newUser: NewUser): Promise<User> {
  const [created] = await db.insert(users).values(newUser).returning()
  if (!created) {
    throw new Error("Insert returned no rows")
  }
  return created
}

export async function getUserById(id: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
  return user ?? null
}
