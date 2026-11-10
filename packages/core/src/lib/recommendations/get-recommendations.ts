import { Activity, ActivityField, BFASScores, MatchLabel, Motivation, PatternTypeId, ScoredRecommendation } from "@touchgrass/types";
import { diversifyAndOrder } from "./diversify.js";
import { calculateRecommendationBaseScore } from "./personality/base-score.js";
import { getOCEANScores } from "./personality/ocean.js";
import { getUserPatternWeights } from "./personality/patterns.js";
import { scoreRecommendation } from "./score.js";

const MAX_RECOMMENDATIONS = 10
const RECOMMENDED_SD_MULTIPLIER = 0.5
const STRONG_PERSONALITY_SD_MULTIPLIER = 1

/*
 * Returns scored, diversified recommendations for a user.
 * Converts BFAS traits → OCEAN → NEO pattern weights, scores each recommendation
 * (including motivation boost), then applies interest-aware diversification and bucket
 * ordering before capping the result. Also returns the slugs browse labels as recommended
 * (every activity scoring at least half a standard deviation above the user's mean score)
 * and the match label browse shows for each activity.
 */
export function getRecommendations(
    userTraits: BFASScores,
    motivations: Motivation[],
    interests: ActivityField[],
    activities: Activity[],
): { recommendations: ScoredRecommendation[]; recommendedSlugs: string[]; matchLabels: Record<string, MatchLabel> } {
    // Get the user's alignment to each NEO pattern from their BFAS scores.
    const bfasToOCEAN = getOCEANScores(userTraits)
    const userPatternWeights = getUserPatternWeights(bfasToOCEAN)

    // Score every activity (personality + motivation), then order them for the recommendations screen.
    const scoredRecommendations = activities.map((rec) => scoreRecommendation(userPatternWeights, rec, motivations))
    const orderedRecommendations = diversifyAndOrder(scoredRecommendations, interests)

    // Find the high scoring activities, and the ones whose personality fit alone is strong.
    const highScoringSlugSet = getHighScoringSlugs(scoredRecommendations)
    const strongPersonalitySlugSet = getStrongPersonalitySlugs(userPatternWeights, activities)

    // Give each activity the match label browse shows.
    const matchLabels = getMatchLabels(activities, highScoringSlugSet, strongPersonalitySlugSet)

    // Return the top MAX_RECOMMENDATIONS for the recommendations screen, the slugs browse marks as recommended, and each activity's match label.
    return {
        recommendations: orderedRecommendations.slice(0, MAX_RECOMMENDATIONS),
        recommendedSlugs: [...highScoringSlugSet],
        matchLabels,
    }
}

/*
 * Match labels: the reason browse gives for each activity, keyed by slug. The first that applies wins:
 * 1. "personality" — passes the strong personality cutoff, whether or not it's high scoring.
 * 2. "good" — any other high scoring activity.
 * Activities with neither are left out.
 */
function getMatchLabels(
    activities: Activity[],
    highScoringSlugSet: Set<string>,
    strongPersonalitySlugSet: Set<string>,
): Record<string, MatchLabel> {
    const matchLabels: Record<string, MatchLabel> = {}
    activities.forEach((rec) => {
        const isStrongPersonality = strongPersonalitySlugSet.has(rec.slug)
        const isRecommended = highScoringSlugSet.has(rec.slug)

        if (isStrongPersonality) matchLabels[rec.slug] = { kind: "personality" }
        else if (isRecommended) matchLabels[rec.slug] = { kind: "good" }
    })
    return matchLabels
}

/*
 * High scoring: every activity in the catalogue whose final score is well above this user's average,
 * for browse. Separate from the top MAX_RECOMMENDATIONS on the recommendations screen, which are diversified.
 * 1. Average every final score (the mean), then measure how spread out they are (the standard deviation, SD).
 * 2. Cutoff = mean + 0.5 × SD; every activity scoring at or above it is high scoring.
 * The cutoff is relative to each user because more motivations raise every score. It typically keeps about a third of the catalogue.
 */
function getHighScoringSlugs(scoredRecommendations: ScoredRecommendation[]): Set<string> {
    const finalScores = scoredRecommendations.map((s) => s.score)
    const finalMean = finalScores.reduce((sum, score) => sum + score, 0) / finalScores.length
    const finalSd = Math.sqrt(finalScores.reduce((sum, score) => sum + (score - finalMean) ** 2, 0) / finalScores.length)
    return new Set(
        scoredRecommendations
            .filter((s) => s.score >= finalMean + finalSd * RECOMMENDED_SD_MULTIPLIER)
            .map((s) => s.rec.slug),
    )
}

/*
 * Strong personality: every activity whose base score (personality only, no motivation boost) is well above this user's average.
 * 1. Average every base score (the mean), then measure how spread out they are (the standard deviation, SD).
 * 2. Cutoff = mean + 1 × SD; an activity must score strictly above it, so a user with no spread (e.g. 50 on every aspect) gets none.
 * The cutoff is relative to each user, so "strong" means strong for this user. It typically keeps about a fifth of the catalogue.
 */
function getStrongPersonalitySlugs(userPatternWeights: Record<PatternTypeId, number>, activities: Activity[]): Set<string> {
    const baseScoredActivities = activities.map((rec) => ({ rec, baseScore: calculateRecommendationBaseScore(userPatternWeights, rec) }))
    const baseMean = baseScoredActivities.reduce((sum, { baseScore }) => sum + baseScore, 0) / baseScoredActivities.length
    const baseSd = Math.sqrt(baseScoredActivities.reduce((sum, { baseScore }) => sum + (baseScore - baseMean) ** 2, 0) / baseScoredActivities.length)
    return new Set(
        baseScoredActivities
            .filter(({ baseScore }) => baseScore > baseMean + baseSd * STRONG_PERSONALITY_SD_MULTIPLIER)
            .map(({ rec }) => rec.slug),
    )
}
