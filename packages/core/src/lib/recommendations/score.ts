import { Activity, Motivation, PatternTypeId, ScoredRecommendation } from "@touchgrass/types";
import { calculateMotivationBoost } from "./motivation/boost.js";
import { calculateRecommendationBaseScore } from "./personality/base-score.js";

const HIGH_FINAL_SCORE_SD_MULTIPLIER = 0.5
const HIGH_BASE_SCORE_SD_MULTIPLIER = 1

/* Combines base pattern affinity with motivation boost to produce a final score. */
export function scoreRecommendation(userPatternWeights: Record<PatternTypeId, number>, recommendation: Activity, motivations: Motivation[]): ScoredRecommendation {
    const baseScore = calculateRecommendationBaseScore(userPatternWeights, recommendation)
    const motivationBoost = calculateMotivationBoost(userPatternWeights, recommendation, motivations)
    return { rec: recommendation, score: baseScore + motivationBoost }
}

/*
 * High final score: every activity in the catalogue whose final score (base + motivation boost) is well above this
 * user's average. Separate from the top recommendations on the recommendations screen, which are diversified.
 * 1. Average every final score (the mean), then measure how spread out they are (the standard deviation, SD).
 * 2. Cutoff = mean + 0.5 × SD; every activity scoring at or above it is kept.
 * The cutoff is relative to each user because more motivations raise every score. It typically keeps about a third of the catalogue.
 */
export function getHighFinalScoreActivities(scoredRecommendations: ScoredRecommendation[]): Activity[] {
    const { mean, sd } = getMeanAndSd(scoredRecommendations.map((s) => s.score))
    return scoredRecommendations
        .filter((s) => s.score >= mean + sd * HIGH_FINAL_SCORE_SD_MULTIPLIER)
        .map((s) => s.rec)
}

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

/* The mean of the given scores, and their (population) standard deviation: how spread out they are around it. */
export function getMeanAndSd(scores: number[]): { mean: number; sd: number } {
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const sd = Math.sqrt(scores.reduce((sum, score) => sum + (score - mean) ** 2, 0) / scores.length)
    return { mean, sd }
}

/* The slugs of the given activities, as a set for quick lookups. */
export function getSlugSet(activities: Activity[]): Set<string> {
    return new Set(activities.map((rec) => rec.slug))
}
