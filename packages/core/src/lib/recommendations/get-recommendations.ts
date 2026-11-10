import { Activity, ActivityField, BFASScores, Motivation, ScoredRecommendation } from "@touchgrass/types";
import { diversifyAndOrder } from "./diversify.js";
import { getOCEANScores } from "./personality/ocean.js";
import { getUserPatternWeights } from "./personality/patterns.js";
import { scoreRecommendation } from "./score.js";

const MAX_RECOMMENDATIONS = 10
const RECOMMENDED_SD_MULTIPLIER = 0.5

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
    // Get the user's alignment to each NEO pattern from their BFAS scores.
    const bfasToOCEAN = getOCEANScores(userTraits)
    const userPatternWeights = getUserPatternWeights(bfasToOCEAN)

    // Score every activity (personality + motivation), then order them for the recommendations screen.
    const scoredRecommendations = activities.map((rec) => scoreRecommendation(userPatternWeights, rec, motivations))
    const orderedRecommendations = diversifyAndOrder(scoredRecommendations, interests)

    // Return the top MAX_RECOMMENDATIONS for the recommendations screen, and the slugs browse marks as recommended.
    return {
        recommendations: orderedRecommendations.slice(0, MAX_RECOMMENDATIONS),
        recommendedSlugs: getHighScoringSlugs(scoredRecommendations),
    }
}

/*
 * High scoring: every activity in the catalogue whose final score is well above this user's average,
 * for browse. Separate from the top MAX_RECOMMENDATIONS on the recommendations screen, which are diversified.
 * 1. Average every final score (the mean), then measure how spread out they are (the standard deviation, SD).
 * 2. Cutoff = mean + 0.5 × SD; every activity scoring at or above it is high scoring.
 * The cutoff is relative to each user because more motivations raise every score. It typically keeps about a third of the catalogue.
 */
function getHighScoringSlugs(scoredRecommendations: ScoredRecommendation[]): string[] {
    const finalScores = scoredRecommendations.map((s) => s.score)
    const finalMean = finalScores.reduce((sum, score) => sum + score, 0) / finalScores.length
    const finalSd = Math.sqrt(finalScores.reduce((sum, score) => sum + (score - finalMean) ** 2, 0) / finalScores.length)
    return scoredRecommendations
        .filter((s) => s.score >= finalMean + finalSd * RECOMMENDED_SD_MULTIPLIER)
        .map((s) => s.rec.slug)
}
