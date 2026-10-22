import { Activity, ActivityField, BFASScores, Motivation, PatternTypeId, ScoredRecommendation } from "@touchgrass/types";
import { diversifyAndOrder } from "./recommendations/diversify.js";
import { calculateMotivationBoost } from "./recommendations/motivation/boost.js";
import { calculateRecommendationBaseScore } from "./recommendations/personality/base-score.js";
import { getOCEANScores } from "./recommendations/personality/ocean.js";
import { getUserPatternWeights } from "./recommendations/personality/patterns.js";

const MAX_RECOMMENDATIONS = 10
const RECOMMENDED_SD_MULTIPLIER = 0.5

/* Combines base pattern affinity with motivation boost to produce a final score. */
export function scoreRecommendation(userPatternWeights: Record<PatternTypeId, number>, recommendation: Activity, motivations: Motivation[]): ScoredRecommendation {
    const baseScore = calculateRecommendationBaseScore(userPatternWeights, recommendation)
    const motivationBoost = calculateMotivationBoost(userPatternWeights, recommendation, motivations)
    return { rec: recommendation, score: baseScore + motivationBoost }
}

/*
 * Returns scored, diversified recommendations for a user.
 * Converts BFAS traits → OCEAN → NEO pattern weights, scores each recommendation
 * (including motivation boost), then applies interest-aware diversification and bucket
 * ordering before capping the result. Also returns the slugs browse labels as recommended:
 * every activity scoring at least half a standard deviation above the user's mean score.
 */
export function getRecommendations(
    userTraits: BFASScores,
    motivations: Motivation[],
    interests: ActivityField[],
    activities: Activity[],
): { recommendations: ScoredRecommendation[]; recommendedSlugs: string[] } {
    const bfasToOCEAN = getOCEANScores(userTraits)
    const userPatternWeights = getUserPatternWeights(bfasToOCEAN)

    const scoredRecommendations = activities.map((rec) => scoreRecommendation(userPatternWeights, rec, motivations))
    const ordered = diversifyAndOrder(scoredRecommendations, interests)

    const scores = scoredRecommendations.map((s) => s.score)
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const sd = Math.sqrt(scores.reduce((sum, score) => sum + (score - mean) ** 2, 0) / scores.length)

    return {
        recommendations: ordered.slice(0, MAX_RECOMMENDATIONS),
        recommendedSlugs: scoredRecommendations
            .filter((s) => s.score >= mean + sd * RECOMMENDED_SD_MULTIPLIER)
            .map((s) => s.rec.slug),
    }
}
