import { eq } from "drizzle-orm"

import { db } from "./client.js"
import { type NewProfile, type Profile, profiles } from "./schema.js"

export async function insertProfile(newProfile: NewProfile): Promise<Profile> {
  const [created] = await db.insert(profiles).values(newProfile).returning()
  if (!created) {
    throw new Error("Insert returned no rows")
  }
  return created
}

export async function getProfileByAuthUserId(
  authUserId: string,
): Promise<Profile | null> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.authUserId, authUserId))
    .limit(1)
  return profile ?? null
}
