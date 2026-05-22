import { eq } from "drizzle-orm"

import { bfasScoresSchema } from "../onboarding/schema.js"
import { db } from "./client.js"
import { type NewProfile, type Profile, profiles } from "./schema.js"

// jsonb columns are typed via Drizzle's .$type<T>() at compile time only, so
// every read and write goes through Zod here to guarantee the row matches the
// shape downstream code expects.
function parsePersonality(profile: Profile): Profile {
  return { ...profile, personality: bfasScoresSchema.parse(profile.personality) }
}

export async function insertProfile(newProfile: NewProfile): Promise<Profile> {
  const personality = bfasScoresSchema.parse(newProfile.personality)
  const [created] = await db
    .insert(profiles)
    .values({ ...newProfile, personality })
    .returning()
  if (!created) {
    throw new Error("Insert returned no rows")
  }
  return parsePersonality(created)
}

export async function getProfileByAuthUserId(
  authUserId: string,
): Promise<Profile | null> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.authUserId, authUserId))
    .limit(1)
  return profile ? parsePersonality(profile) : null
}
