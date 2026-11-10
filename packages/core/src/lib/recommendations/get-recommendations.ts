import { Activity, ActivityField, BFASScores, MatchLabel, Motivation, PatternTypeId, SharedActivityTypesByMotivation, ScoredRecommendation } from "@touchgrass/types";
import { diversifyAndOrder } from "./diversify.js";
import { calculateRecommendationBaseScore } from "./personality/base-score.js";
import { getOCEANScores } from "./personality/ocean.js";
import { getUserPatternWeights } from "./personality/patterns.js";
import { scoreRecommendation } from "./score.js";
import { getDominantPatternId } from "@touchgrass/types/dominant-pattern";

const MAX_RECOMMENDATIONS = 10
const RECOMMENDED_SD_MULTIPLIER = 0.5
const STRONG_PERSONALITY_SD_MULTIPLIER = 1
const STRONG_MOTIVATION_MIN_OVERLAPS = 2

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

    // Give each activity the match label browse shows, with the reasons behind it.
    const matchLabels = getMatchLabels(activities, motivations, userPatternWeights, highScoringSlugSet, strongPersonalitySlugSet)

    // Return the top MAX_RECOMMENDATIONS for the recommendations screen, the slugs browse marks as recommended, and each activity's match label.
    return {
        recommendations: orderedRecommendations.slice(0, MAX_RECOMMENDATIONS),
        recommendedSlugs: [...highScoringSlugSet],
        matchLabels,
    }
}

/*
 * Match labels: the reason browse gives for each activity, keyed by slug. The first that applies wins:
 * 1. "strong" — qualifies for both "personality" and "motivation".
 * 2. "personality" — passes the strong personality cutoff, whether or not it's high scoring.
 * 3. "motivation" — high scoring, and two or more selected motivations share a type with it.
 *    Limited to high scoring activities because every activity overlaps at least two of the seven motivations.
 * 4. "good" — any other high scoring activity that shares at least one motivation, so every label has a reason to show.
 * Each label carries its reasons: the user's best pattern for personality, and each overlapping motivation (by value) with
 * the activity types it shares. Activities with none of these labels are left out.
 */
function getMatchLabels(
    activities: Activity[],
    userMotivations: Motivation[],
    userPatternWeights: Record<PatternTypeId, number>,
    highScoringSlugSet: Set<string>,
    strongPersonalitySlugSet: Set<string>,
): Record<string, MatchLabel> {
    const matchLabels: Record<string, MatchLabel> = {}
    activities.forEach((rec) => {
        // Find which of the user's motivations share activity types with this activity, and how many do.
        const sharedActivityTypesByMotivation = getSharedActivityTypesBetweenActivityAndUserMotivations(rec, userMotivations)
        const overlappingMotivationCount = Object.keys(sharedActivityTypesByMotivation).length

        // Check which labels the activity qualifies for: strong personality, recommended, strong motivation.
        const isStrongPersonality = strongPersonalitySlugSet.has(rec.slug)
        const isRecommended = highScoringSlugSet.has(rec.slug)
        const isStrongMotivation = isRecommended && overlappingMotivationCount >= STRONG_MOTIVATION_MIN_OVERLAPS

        // Strong personality matches always have a pattern of 0.6+, which becomes the personality reason.
        const patternId = isStrongPersonality ? getDominantPatternId(userPatternWeights, rec) : null

        // Pick the first label that applies, with its reasons; unlabelled activities are left out.
        if (patternId && isStrongMotivation) matchLabels[rec.slug] = { kind: "strong", patternId, sharedActivityTypesByMotivation }
        else if (patternId) matchLabels[rec.slug] = { kind: "personality", patternId }
        else if (isStrongMotivation) matchLabels[rec.slug] = { kind: "motivation", sharedActivityTypesByMotivation }
        else if (isRecommended && overlappingMotivationCount >= 1) matchLabels[rec.slug] = { kind: "good", sharedActivityTypesByMotivation }
    })
    return matchLabels
}

/*
 * Shared activity types by motivation: for each of the user's motivations, the activity types it has in common with this
 * activity (its primary type plus related types). Motivations sharing none are left out, so the number of keys is how many
 * motivations overlap the activity.
 */
export function getSharedActivityTypesBetweenActivityAndUserMotivations(activity: Activity, userMotivations: Motivation[]): SharedActivityTypesByMotivation {
    const activityTypes = [activity.type, ...(activity.related_types ?? [])]
    const sharedActivityTypesByMotivation: SharedActivityTypesByMotivation = {}
    userMotivations.forEach((m) => {
        const sharedActivityTypes = m.associated_activity_types.filter((t) => activityTypes.includes(t))
        if (sharedActivityTypes.length > 0) sharedActivityTypesByMotivation[m.value] = sharedActivityTypes
    })
    return sharedActivityTypesByMotivation
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
 * Strong personality: activities that pass both personality checks.
 * 1. Better fit than most — does this activity suit the user better than most activities? Compares the activity's base score
 *    (how well the activity's patterns as a whole fit the user) with their other activities. See getBetterFitThanMostSlugs.
 * 2. High-scoring pattern — does the user have a strong trait connected to this activity? The single best weight among the
 *    activity's patterns must be at least MIN_DOMINANT_WEIGHT (0.6). Most activities pass this for a user with a few strong
 *    traits, so on its own it doesn't single any out.
 * Each catches what the other misses: middling users pass check 1 with nothing high, and users with a few strong traits pass
 * check 2 on nearly every activity. Together they keep "You scored highly as …" true.
 */
function getStrongPersonalitySlugs(userPatternWeights: Record<PatternTypeId, number>, activities: Activity[]): Set<string> {
    const betterFitThanMostSlugs = getBetterFitThanMostSlugs(userPatternWeights, activities)
    return new Set(
        activities
            .filter((rec) => betterFitThanMostSlugs.has(rec.slug) && getDominantPatternId(userPatternWeights, rec) !== null)
            .map((rec) => rec.slug),
    )
}

/*
 * Better fit than most: activities whose base score is well above this user's average base score.
 * The base score is personality only: the user's average weight on the primary type's patterns, plus 0.2 × their average
 * weight on the related types' patterns (see personality/base-score.ts).
 * 1. Average every base score (the mean), then measure how spread out they are (the standard deviation, SD).
 * 2. Cutoff = mean + 1 × SD; an activity must score strictly above it, so a user with no spread (e.g. 50 on every aspect) gets none.
 * The cutoff is relative, so this ranks activities against each other rather than measuring how well any one fits.
 */
function getBetterFitThanMostSlugs(userPatternWeights: Record<PatternTypeId, number>, activities: Activity[]): Set<string> {
    const baseScoredActivities = activities.map((rec) => ({ rec, baseScore: calculateRecommendationBaseScore(userPatternWeights, rec) }))
    const baseMean = baseScoredActivities.reduce((sum, { baseScore }) => sum + baseScore, 0) / baseScoredActivities.length
    const baseSd = Math.sqrt(baseScoredActivities.reduce((sum, { baseScore }) => sum + (baseScore - baseMean) ** 2, 0) / baseScoredActivities.length)
    return new Set(
        baseScoredActivities
            .filter(({ baseScore }) => baseScore > baseMean + baseSd * STRONG_PERSONALITY_SD_MULTIPLIER)
            .map(({ rec }) => rec.slug),
    )
}
