import type { Request, Response } from "express"

import type { Profile } from "../db/schema.js"
import { getRecommendations } from "../lib/recommendation-algorithm.js"

export type GetRecommendationsDeps = {
  getProfileByAuthUserId: (authUserId: string) => Promise<Profile | null>
  getSessionUserId: (req: Request) => Promise<string | null>
}

export function getRecommendationsHandler({
  getProfileByAuthUserId,
  getSessionUserId,
}: GetRecommendationsDeps) {
  return async function handler(req: Request, res: Response) {
    const authUserId = await getSessionUserId(req)
    if (!authUserId) {
      res.status(401).json({ error: "Not authenticated" })
      return
    }

    try {
      const profile = await getProfileByAuthUserId(authUserId)
      if (!profile) {
        res.status(404).json({ error: "Profile not found" })
        return
      }
      const recommendations = getRecommendations(profile.personality).map(
        (s) => s.rec,
      )
      res.status(200).json({ recommendations })
    } catch (error) {
      console.error("Failed to get recommendations", error)
      res.status(500).json({ error: "Failed to get recommendations" })
    }
  }
}
