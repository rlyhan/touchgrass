import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations";
import { ActivityField, ActivityType, BFASScores, Motivation, Recommendation } from "@touchgrass/types";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_PATTERNS } from "@touchgrass/types/constants";
import { calculateActivityPatternAffinity, calculateMotivationBoost, getMotivationRelevantTraits, getOCEANScores, getUserPatternStrengths } from "./helpers/index.js";

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

/*
 * Calculates the base score for a recommendation based on pattern affinity.
 * eg. "Spend a Month Visiting Antique Markets" -> type: Exploratory, related_types: Social, Reflective
 * User's match with primary patterns = 0.55, secondary patterns = 0.61
 * Base score = 0.55 * 0.7 + 0.61 * 0.3 = 0.568
 */
function calculateRecommendationBaseScore(
    userPatternStrengths: Record<string, number>,
    recommendation: Recommendation,
): number {
    const primaryPatterns = ACTIVITY_TYPE_PATTERNS[recommendation.type] ?? []
    const primaryAffinity = calculateActivityPatternAffinity(userPatternStrengths, primaryPatterns)

    const secondaryPatterns = (recommendation.related_types ?? []).flatMap(
        (t) => ACTIVITY_TYPE_PATTERNS[t] ?? []
    )
    const secondaryAffinity = calculateActivityPatternAffinity(userPatternStrengths, secondaryPatterns)

    return secondaryPatterns.length === 0
        ? primaryAffinity
        : primaryAffinity * PRIMARY_WEIGHT + secondaryAffinity * SECONDARY_WEIGHT
}

/* Combines base pattern affinity with motivation boost to produce a final score. */
function scoreRecommendation(userPatternStrengths: Record<string, number>, recommendation: Recommendation, motivations: Motivation[]): ScoredRecommendation {
    const baseScore = calculateRecommendationBaseScore(userPatternStrengths, recommendation)

    const motivationRelevantTraits = getMotivationRelevantTraits({ activity: recommendation, motivations })
    const motivationBoost = motivationRelevantTraits.length > 0
        ? calculateMotivationBoost(userPatternStrengths, motivationRelevantTraits)
        : 0

    return { rec: recommendation, score: baseScore + motivationBoost }
}

/*
 * Selects a diverse set of recommendations, prioritising strong matches across different activity types.
 * - Filters to recommendations above the strong-match affinity threshold
 * - Picks the highest-scoring recommendation per activity type
 * Returns the full type-representative set without truncating, so downstream stages
 * (e.g. interest boosting) can choose from a wider pool before the final cap is applied.
 */
function getDiverseRecommendations(recommendations: ScoredRecommendation[]): ScoredRecommendation[] {
    const strongMatches = recommendations.filter((recommendation) => recommendation.score >= MIN_PRIMARY_AFFINITY_FOR_STRONG_MATCH)

    const bestByType: Partial<Record<ActivityType, ScoredRecommendation>> = {}
    for (const recommendation of strongMatches) {
        const type = recommendation.rec.type
        if (!bestByType[type] || recommendation.score > (bestByType[type] as ScoredRecommendation).score) {
            bestByType[type] = recommendation
        }
    }

    return Object.values(bestByType).filter(Boolean) as ScoredRecommendation[]
}

/*
 * Boosts recommendations whose `field` matches one of the user's selected interests by
 * partitioning into matches + others, sorting each group by descending score, and
 * concatenating matches first.
 */
function applyInterestBoost(
    recommendations: ScoredRecommendation[],
    interests: ActivityField[],
): ScoredRecommendation[] {
    const interestSet = new Set<ActivityField>(interests)
    const matches: ScoredRecommendation[] = []
    const others: ScoredRecommendation[] = []
    for (const scored of recommendations) {
        if (interestSet.has(scored.rec.field)) {
            matches.push(scored)
        } else {
            others.push(scored)
        }
    }
    matches.sort((a, b) => b.score - a.score)
    others.sort((a, b) => b.score - a.score)
    return [...matches, ...others]
}

/*
 * Returns scored, diverse recommendations for a user.
 * Converts BFAS traits → OCEAN → NEO pattern strengths, scores each recommendation,
 * diversifies across activity types, then boosts recommendations matching the user's interests.
 */
export function getRecommendations(
    userTraits: BFASScores,
    motivations: Motivation[],
    interests: ActivityField[],
): ScoredRecommendation[] {
    const bfasToOCEAN = getOCEANScores(userTraits)
    const userPatternStrengths = getUserPatternStrengths(bfasToOCEAN)

    // Use mock RECOMMENDATIONS data for now
    const scoredRecommendations = RECOMMENDATIONS.map((rec) => scoreRecommendation(userPatternStrengths, rec, motivations))

    const diverse = getDiverseRecommendations(scoredRecommendations)
    return applyInterestBoost(diverse, interests).slice(0, MAX_RECOMMENDATIONS)
}

/* Returns the top-scoring activity types for a user based on their BFAS traits. */
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
