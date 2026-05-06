import { db } from "./client.js"
import { type NewUser, type User, users } from "./schema.js"

export async function insertUser(newUser: NewUser): Promise<User> {
  const [created] = await db.insert(users).values(newUser).returning()
  if (!created) {
    throw new Error("Insert returned no rows")
  }
  return created
}
