import type { Request, Response } from "express"

import type { PatternWeightsResponse } from "@touchgrass/types"
import type { Profile } from "../db/schema.js"
import { getOCEANScores, getUserPatternWeights } from "../lib/helpers/index.js"

export type GetPatternWeightsDeps = {
  getProfileByAuthUserId: (authUserId: string) => Promise<Profile | null>
  getSessionUserId: (req: Request) => Promise<string | null>
}

export function getPatternWeightsHandler({
  getProfileByAuthUserId,
  getSessionUserId,
}: GetPatternWeightsDeps) {
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

    const patternWeights = getUserPatternWeights(
      getOCEANScores(profile.personality),
    )
    const body: PatternWeightsResponse = { patternWeights }
    res.status(200).json(body)
  }
}
