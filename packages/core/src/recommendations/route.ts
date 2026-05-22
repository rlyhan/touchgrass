import type { Request, Response } from "express"

import type { ActivityField, Motivation } from "@touchgrass/types"
import { ACTIVITY_FIELDS, MOTIVATION_OPTIONS } from "@touchgrass/types/constants"
import type { Profile } from "../db/schema.js"
import { getRecommendations } from "../lib/recommendation-algorithm.js"
import type { LoadRecommendations } from "./source.js"

export type GetRecommendationsDeps = {
  getProfileByAuthUserId: (authUserId: string) => Promise<Profile | null>
  getSessionUserId: (req: Request) => Promise<string | null>
  loadRecommendations: LoadRecommendations
}

export function getRecommendationsHandler({
  getProfileByAuthUserId,
  getSessionUserId,
  loadRecommendations,
}: GetRecommendationsDeps) {
  return async function handler(req: Request, res: Response): Promise<void> {
    const authUserId = await getSessionUserId(req)
    if (!authUserId) {
      res.status(401).json({ error: "Not authenticated" })
      return
    }

    const profile = await getProfileByAuthUserId(authUserId)
    if (!profile) {
      res.status(404).json({ error: "Profile not found" })
      return
    }
    const personality = profile.personality
    const motivations = profile.motivations
      .map((v) => MOTIVATION_OPTIONS.find((m) => m.value === v))
      .filter((m): m is Motivation => m !== undefined)
    const interests = profile.interests.filter((i): i is ActivityField =>
      (ACTIVITY_FIELDS as readonly string[]).includes(i),
    )
    const recommendations = getRecommendations(
      personality,
      motivations,
      interests,
      await loadRecommendations(),
    ).map((s) => s.rec)
    res.status(200).json({ recommendations })
  }
}
