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

export function getRecommendations(userTraits: BFASScores): ScoredRecommendation[] {
    // Patterns are defined against OCEAN, so collapse the user's BFAS aspects first.
    const bfasToOCEAN = getOCEANScores(userTraits)
    const userPatternStrengths = getUserPatternStrengths(bfasToOCEAN)

    const scored: ScoredRecommendation[] = []

    for (const recommendation of RECOMMENDATIONS) {
        const primaryPatterns = ActivityTypePatterns[recommendation.type] ?? []
        const primaryAffinity = calculateActivityPatternAffinity(userPatternStrengths, primaryPatterns)

        const secondaryPatterns = (recommendation.related_types ?? []).flatMap(
            (t) => ActivityTypePatterns[t] ?? []
        )
        const secondaryAffinity = calculateActivityPatternAffinity(userPatternStrengths, secondaryPatterns)

        const finalScore = secondaryPatterns.length === 0
            ? primaryAffinity
            : primaryAffinity * PRIMARY_WEIGHT + secondaryAffinity * SECONDARY_WEIGHT

        scored.push({ rec: recommendation, score: finalScore })
    }

    // Sort highest → lowest, then take the top N
    scored.sort((a, b) => b.score - a.score)

    return scored.slice(0, MAX_RECOMMENDATIONS)
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
