import type { Request, Response } from "express"

import { requireUser, type SessionDeps } from "../../auth/require-user.js"
import type { PatternWeightsResponse } from "@touchgrass/types"
import type { ProfileLookupDeps } from "../../db/queries.js"
import { getUserPatternWeightsFromBfas } from "../../engine/personality/patterns.js"

export type GetPatternWeightsDeps = SessionDeps & ProfileLookupDeps

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

    const patternWeights = getUserPatternWeightsFromBfas(profile.personality)
    const body: PatternWeightsResponse = { patternWeights }
    res.status(200).json(body)
  })
}
