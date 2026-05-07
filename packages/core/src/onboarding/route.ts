import type { Request, Response } from "express"

import type { NewProfile, Profile } from "../db/schema.js"
import { onboardingFormSchema } from "./schema.js"

export type CreateProfileDeps = {
  insertProfile: (newProfile: NewProfile) => Promise<Profile>
  getSessionUserId: (req: Request) => Promise<string | null>
}

export function createProfileHandler({
  insertProfile,
  getSessionUserId,
}: CreateProfileDeps) {
  return async function handler(req: Request, res: Response) {
    const authUserId = await getSessionUserId(req)
    if (!authUserId) {
      res.status(401).json({ error: "Not authenticated" })
      return
    }

    const parsed = onboardingFormSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.issues })
      return
    }

    const payload = parsed.data
    const newProfile: NewProfile = {
      authUserId,
      name: payload.name,
      birthdate: payload.birthdate,
      heightCm: Number(payload.heightCm),
      gender: payload.gender,
      build: payload.build,
      location: payload.location,
      employment: payload.employment,
      interests: payload.interests,
      personality: payload.personality,
      motivations: payload.motivations,
    }

    try {
      const created = await insertProfile(newProfile)
      res.status(201).json({ profile: created })
    } catch (error) {
      console.error("Failed to create profile", error)
      res.status(500).json({ error: "Failed to create profile" })
    }
  }
}
