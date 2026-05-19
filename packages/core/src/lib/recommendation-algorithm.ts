import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations";
import { Activity, ActivityField, BFASScores, Motivation, PatternTypeId, ScoredActivityType, ScoredRecommendation } from "@touchgrass/types";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_PATTERNS } from "@touchgrass/types/constants";
import {
    calculateActivityPatternAffinity,
    calculateMotivationBoost,
    diversifyAndOrder,
    getOCEANScores,
    getUserPatternWeights,
} from "./helpers/index.js";

const PRIMARY_WEIGHT = 0.7
const SECONDARY_WEIGHT = 0.3
const MAX_RECOMMENDATIONS = 3
const TOP_ACTIVITY_TYPES_COUNT = 6

/*
 * Calculates the base score for a recommendation based on pattern affinity.
 * eg. "Spend a Month Visiting Antique Markets" -> type: Exploratory, related_types: Social, Reflective
 * User's match with primary patterns = 0.63, secondary patterns = 0.59
 * Base score = (0.63 * 0.7) + (0.59 * 0.3) = 0.62
 */
export function calculateRecommendationBaseScore(
    userPatternWeights: Record<PatternTypeId, number>,
    recommendation: Activity,
): number {
    const primaryPatterns = ACTIVITY_TYPE_PATTERNS[recommendation.type] ?? []
    const primaryAffinity = calculateActivityPatternAffinity(userPatternWeights, primaryPatterns)

    const secondaryPatterns = (recommendation.related_types ?? []).flatMap(
        (t) => ACTIVITY_TYPE_PATTERNS[t] ?? []
    )
    const secondaryAffinity = calculateActivityPatternAffinity(userPatternWeights, secondaryPatterns)

    return secondaryPatterns.length === 0
        ? primaryAffinity
        : primaryAffinity * PRIMARY_WEIGHT + secondaryAffinity * SECONDARY_WEIGHT
}

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
 * ordering before capping the result.
 */
export function getRecommendations(
    userTraits: BFASScores,
    motivations: Motivation[],
    interests: ActivityField[],
): ScoredRecommendation[] {
    const bfasToOCEAN = getOCEANScores(userTraits)
    const userPatternWeights = getUserPatternWeights(bfasToOCEAN)

    const scoredRecommendations = RECOMMENDATIONS.map((rec) => scoreRecommendation(userPatternWeights, rec, motivations))

    return diversifyAndOrder(scoredRecommendations, interests).slice(0, MAX_RECOMMENDATIONS)
}

/* Returns the top-scoring activity types for a user based on their BFAS traits. */
export function getTopActivityTypes(
    userTraits: BFASScores,
    count: number = TOP_ACTIVITY_TYPES_COUNT,
): ScoredActivityType[] {
    const bfasToOCEAN = getOCEANScores(userTraits)
    const userPatternWeights = getUserPatternWeights(bfasToOCEAN)

    const scored: ScoredActivityType[] = ACTIVITY_TYPES.map((type) => ({
        type,
        score: calculateActivityPatternAffinity(
            userPatternWeights,
            ACTIVITY_TYPE_PATTERNS[type] ?? [],
        ),
    }))

    scored.sort((a, b) => b.score - a.score)

    return scored.slice(0, count)
}
