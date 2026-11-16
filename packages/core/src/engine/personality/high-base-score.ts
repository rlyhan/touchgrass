import { Activity, PatternTypeId } from "@touchgrass/types"
import { getMeanAndSd } from "../utils.js"
import { calculateRecommendationBaseScore } from "./base-score.js"

const HIGH_BASE_SCORE_SD_MULTIPLIER = 1

/*
 * High base score: activities whose base score is well above this user's average base score.
 * The base score is personality only: the user's average weight on the primary type's patterns, plus 0.2 × their average
 * weight on the related types' patterns (see personality/base-score.ts).
 * 1. Average every base score (the mean), then measure how spread out they are (the standard deviation, SD).
 * 2. Cutoff = mean + 1 × SD; an activity must score strictly above it, so a user with no spread (e.g. 50 on every aspect) gets none.
 * The cutoff is relative, so this ranks activities against each other rather than measuring how well any one fits.
 */
export function getHighBaseScoreActivities(userPatternWeights: Record<PatternTypeId, number>, activities: Activity[]): Activity[] {
    const baseScoredActivities = activities.map((rec) => ({ rec, baseScore: calculateRecommendationBaseScore(userPatternWeights, rec) }))
    const { mean, sd } = getMeanAndSd(baseScoredActivities.map(({ baseScore }) => baseScore))
    return baseScoredActivities
        .filter(({ baseScore }) => baseScore > mean + sd * HIGH_BASE_SCORE_SD_MULTIPLIER)
        .map(({ rec }) => rec)
}
