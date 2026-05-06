import type { Request, Response } from "express"

import type { NewUser, User } from "../db/schema.js"
import { onboardingFormSchema } from "./schema.js"

export type CreateUserDeps = {
  insertUser: (newUser: NewUser) => Promise<User>
}

export function createUserHandler({ insertUser }: CreateUserDeps) {
  return async function handler(req: Request, res: Response) {
    const parsed = onboardingFormSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.issues })
      return
    }

    const payload = parsed.data
    const newUser: NewUser = {
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
      const created = await insertUser(newUser)
      res.status(201).json({ user: created })
    } catch (error) {
      console.error("Failed to create user", error)
      res.status(500).json({ error: "Failed to create user" })
    }
  }
}
