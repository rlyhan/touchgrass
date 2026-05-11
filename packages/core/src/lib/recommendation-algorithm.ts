import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations";
import { ActivityType, BFASScores, Recommendation } from "@touchgrass/types";
import { ACTIVITY_TYPES, ActivityTypePatterns } from "@touchgrass/types/constants";
import { calculateActivityPatternAffinity, getOCEANScores, getUserPatternStrengths } from "./helpers.js";

export type ScoredRecommendation = {
    rec: Recommendation
    score: number
}

export type ScoredActivityType = {
    type: ActivityType
    score: number
}

const PRIMARY_WEIGHT = 0.7
const SECONDARY_WEIGHT = 0.3
const MAX_RECOMMENDATIONS = 3
const TOP_ACTIVITY_TYPES_COUNT = 6

function scoreRecommendation(userPatternStrengths: Record<string, number>, recommendation: Recommendation): ScoredRecommendation {
    const primaryPatterns = ActivityTypePatterns[recommendation.type] ?? []
    const primaryAffinity = calculateActivityPatternAffinity(userPatternStrengths, primaryPatterns)

    const secondaryPatterns = (recommendation.related_types ?? []).flatMap(
        (t) => ActivityTypePatterns[t] ?? []
    )
    const secondaryAffinity = calculateActivityPatternAffinity(userPatternStrengths, secondaryPatterns)

    const finalScore = secondaryPatterns.length === 0
        ? primaryAffinity
        : primaryAffinity * PRIMARY_WEIGHT + secondaryAffinity * SECONDARY_WEIGHT

    return { rec: recommendation, score: finalScore }
}

export function getRecommendations(userTraits: BFASScores): ScoredRecommendation[] {
    // Patterns are defined against OCEAN, so collapse the user's BFAS aspects first.
    const bfasToOCEAN = getOCEANScores(userTraits)
    const userPatternStrengths = getUserPatternStrengths(bfasToOCEAN)

    // Use mock RECOMMENDATIONS data for now
    const scoredRecommendations = RECOMMENDATIONS.map((rec) => scoreRecommendation(userPatternStrengths, rec)).sort((a, b) => b.score - a.score)

    return scoredRecommendations.slice(0, MAX_RECOMMENDATIONS)
}

export function getTopActivityTypes(
    userTraits: BFASScores,
    count: number = TOP_ACTIVITY_TYPES_COUNT,
): ScoredActivityType[] {
    const bfasToOCEAN = getOCEANScores(userTraits)
    const userPatternStrengths = getUserPatternStrengths(bfasToOCEAN)

    const scored: ScoredActivityType[] = ACTIVITY_TYPES.map((type) => ({
        type,
        score: calculateActivityPatternAffinity(
            userPatternStrengths,
            ActivityTypePatterns[type] ?? [],
        ),
    }))

    scored.sort((a, b) => b.score - a.score)

    return scored.slice(0, count)
}
