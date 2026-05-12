import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations";
import { ActivityType, BFASScores, Recommendation } from "@touchgrass/types";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_PATTERNS } from "@touchgrass/types/constants";
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
const MIN_PRIMARY_AFFINITY_FOR_STRONG_MATCH = 0.65
const MAX_RECOMMENDATIONS = 3
const TOP_ACTIVITY_TYPES_COUNT = 6

function scoreRecommendation(userPatternStrengths: Record<string, number>, recommendation: Recommendation): ScoredRecommendation {
    const primaryPatterns = ACTIVITY_TYPE_PATTERNS[recommendation.type] ?? []
    const primaryAffinity = calculateActivityPatternAffinity(userPatternStrengths, primaryPatterns)

    const secondaryPatterns = (recommendation.related_types ?? []).flatMap(
        (t) => ACTIVITY_TYPE_PATTERNS[t] ?? []
    )
    const secondaryAffinity = calculateActivityPatternAffinity(userPatternStrengths, secondaryPatterns)

    const finalScore = secondaryPatterns.length === 0
        ? primaryAffinity
        : primaryAffinity * PRIMARY_WEIGHT + secondaryAffinity * SECONDARY_WEIGHT

    return { rec: recommendation, score: finalScore }
}

function getDiverseRecommendations(recommendations: ScoredRecommendation[]): ScoredRecommendation[] {
    // Get recommendations with match score >= MIN_PRIMARY_AFFINITY_FOR_STRONG_MATCH
    const strongMatches = recommendations.filter((recommendation) => recommendation.score >= MIN_PRIMARY_AFFINITY_FOR_STRONG_MATCH)

    // Identify the strongest scoring recommendation for each activity type
    const bestByType: Partial<Record<ActivityType, ScoredRecommendation>> = {}
    for (const recommendation of strongMatches) {
        const type = recommendation.rec.type
        if (!bestByType[type] || recommendation.score > (bestByType[type] as ScoredRecommendation).score) {
            bestByType[type] = recommendation
        }
    }

    // Collect defined best values (filter out any undefined entries)
    const bestValues = Object.values(bestByType).filter(Boolean) as ScoredRecommendation[]

    // If there are at least MAX_RECOMMENDATIONS, return them all
    if (bestValues.length >= MAX_RECOMMENDATIONS) {
        return bestValues.slice(0, MAX_RECOMMENDATIONS)
    }

    // Otherwise, add the next highest-scoring matches
    return [...bestValues, ...strongMatches.filter((rec) => !bestByType[rec.rec.type])].slice(0, MAX_RECOMMENDATIONS)
}

export function getRecommendations(userTraits: BFASScores): ScoredRecommendation[] {
    // Patterns are defined against OCEAN, so collapse the user's BFAS aspects first.
    const bfasToOCEAN = getOCEANScores(userTraits)
    const userPatternStrengths = getUserPatternStrengths(bfasToOCEAN)

    // Use mock RECOMMENDATIONS data for now
    const scoredRecommendations = RECOMMENDATIONS.map((rec) => scoreRecommendation(userPatternStrengths, rec))

    return getDiverseRecommendations(scoredRecommendations).sort((a, b) => b.score - a.score).slice(0, MAX_RECOMMENDATIONS)
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
            ACTIVITY_TYPE_PATTERNS[type] ?? [],
        ),
    }))

    scored.sort((a, b) => b.score - a.score)

    return scored.slice(0, count)
}
