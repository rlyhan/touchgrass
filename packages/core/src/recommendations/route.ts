import type { Request, Response } from "express"

import type {
  ActivityField,
  Motivation,
  RecommendationsResponse,
} from "@touchgrass/types"
import { ACTIVITY_FIELDS, MOTIVATION_OPTIONS } from "@touchgrass/types/constants"
import { requireUser } from "../auth/require-user.js"
import type { Profile } from "../db/schema.js"
import { getRecommendations } from "../lib/recommendations/get-recommendations.js"
import { getOCEANScores } from "../lib/recommendations/personality/ocean.js"
import { getUserPatternWeights } from "../lib/recommendations/personality/patterns.js"
import type { LoadActivities } from "./source.js"

export type GetRecommendationsDeps = {
  getProfileByAuthUserId: (authUserId: string) => Promise<Profile | null>
  getSessionUserId: (req: Request) => Promise<string | null>
  loadActivities: LoadActivities
}

export function getRecommendationsHandler({
  getProfileByAuthUserId,
  getSessionUserId,
  loadActivities,
}: GetRecommendationsDeps) {
  return requireUser(getSessionUserId, async (req: Request, res: Response, authUserId: string) => {
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
    const patternWeights = getUserPatternWeights(getOCEANScores(personality))
    const { recommendations: scored, matchLabels } = getRecommendations(
      personality,
      motivations,
      interests,
      await loadActivities(),
    )
    const recommendations = scored.map((s) => s.rec)
    const body: RecommendationsResponse = { recommendations, patternWeights, matchLabels, interests }
    res.status(200).json(body)
  })
}
