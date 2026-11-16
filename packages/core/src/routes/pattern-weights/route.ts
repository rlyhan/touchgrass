import type { Request, Response } from "express"

import { requireUser } from "../../auth/require-user.js"
import type { PatternWeightsResponse } from "@touchgrass/types"
import type { Profile } from "../../db/schema.js"
import { getOCEANScores } from "../../engine/personality/ocean.js"
import { getUserPatternWeights } from "../../engine/personality/patterns.js"

export type GetPatternWeightsDeps = {
  getProfileByAuthUserId: (authUserId: string) => Promise<Profile | null>
  getSessionUserId: (req: Request) => Promise<string | null>
}

export function getPatternWeightsHandler({
  getProfileByAuthUserId,
  getSessionUserId,
}: GetPatternWeightsDeps) {
  return requireUser(getSessionUserId, async (req: Request, res: Response, authUserId: string) => {
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
  })
}
