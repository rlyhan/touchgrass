import type { Request, Response } from "express"

import { requireUser, type SessionDeps } from "../../auth/require-user.js"
import type { ProfileLookupDeps } from "../../db/queries.js"
import type { NewProfile, Profile, UpdateProfile } from "../../db/schema/index.js"
import { onboardingFormSchema, profileUpdateSchema } from "./schema.js"

export type GetProfileDeps = SessionDeps & ProfileLookupDeps

export function getProfileHandler({ getProfileByAuthUserId, getSessionUserId }: GetProfileDeps) {
  return requireUser(getSessionUserId, async (_req: Request, res: Response, authUserId: string) => {
    const profile = await getProfileByAuthUserId(authUserId)
    if (!profile) {
      res.status(404).json({ error: "Profile not found" })
      return
    }
    res.status(200).json({ profile })
  })
}

export type CreateProfileDeps = SessionDeps &
  ProfileLookupDeps & {
    insertProfile: (newProfile: NewProfile) => Promise<Profile>
  }

export function createProfileHandler({
  insertProfile,
  getProfileByAuthUserId,
  getSessionUserId,
}: CreateProfileDeps) {
  return requireUser(getSessionUserId, async (req: Request, res: Response, authUserId: string) => {
    const parsed = onboardingFormSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({
        errors: parsed.error.issues.map(({ path, message }) => ({ path, message })),
      })
      return
    }

    const existing = await getProfileByAuthUserId(authUserId)
    if (existing) {
      res.status(409).json({ error: "Profile already exists" })
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
      if ((error as { code?: string }).code === "23505") {
        res.status(409).json({ error: "Profile already exists" })
        return
      }
      throw error
    }
  })
}

export type UpdateProfileDeps = SessionDeps &
  {
    updateProfileByAuthUserId: (authUserId: string, updates: UpdateProfile) => Promise<Profile | null>
  }

export function updateProfileHandler({ updateProfileByAuthUserId, getSessionUserId }: UpdateProfileDeps) {
  return requireUser(getSessionUserId, async (req: Request, res: Response, authUserId: string) => {
    const parsed = profileUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({
        errors: parsed.error.issues.map(({ path, message }) => ({ path, message })),
      })
      return
    }

    const payload = parsed.data
    const updatedProfile = await updateProfileByAuthUserId(authUserId, payload)
    if (!updatedProfile) {
      res.status(404).json({ error: "Profile not found" })
      return
    }
    res.status(204).send()
  })
}
