import type { Activity, MatchLabel, Motivation, PatternTypeId } from "@touchgrass/types"
import { getDominantPatternId } from "@touchgrass/types/dominant-pattern"
import { getSharedActivityTypesBetweenActivityAndUserMotivations } from "./motivation/shared-activity-types.js"
import { getHighBaseScoreActivities, getSlugSet } from "./score.js"

// Match labels browse shows for each activity: the conditions that decide each label, and the reasons it carries.

const STRONG_MOTIVATION_MIN_OVERLAPS = 2

const STRONG_MATCH = "strong"
const PERSONALITY_MATCH = "personality"
const MOTIVATION_MATCH = "motivation"
const GOOD_MATCH = "good"

/*
 * Match labels: the label browse gives for each activity, keyed by slug, chosen by getMatchLabelKind.
 * Each label carries its reasons: the user's best pattern for personality, and each overlapping motivation (by value) with
 * the activity types it shares. Activities with no label are left out.
 */
export function getMatchLabels(
    activities: Activity[],
    userMotivations: Motivation[],
    userPatternWeights: Record<PatternTypeId, number>,
    highScoringSlugSet: Set<string>,
): Record<string, MatchLabel> {
    const topPersonalityFitSlugSet = getSlugSet(getHighBaseScoreActivities(userPatternWeights, activities))
    const matchLabels: Record<string, MatchLabel> = {}
    activities.forEach((rec) => {
        // Find which of the user's motivations share activity types with this activity, and how many do.
        const sharedActivityTypesByMotivation = getSharedActivityTypesBetweenActivityAndUserMotivations(rec, userMotivations)
        const overlappingMotivationCount = Object.keys(sharedActivityTypesByMotivation).length

        // Evaluate each condition, then pick the label they earn.
        const isHighScoring = highScoringSlugSet.has(rec.slug)
        const patternId = getDominantPatternId(userPatternWeights, rec)
        const kind = getMatchLabelKind(
            isStrongPersonality(topPersonalityFitSlugSet.has(rec.slug), patternId),
            isStrongMotivation(isHighScoring, overlappingMotivationCount),
            isGoodMatch(isHighScoring, overlappingMotivationCount),
        )

        // Attach the reasons each label shows; unlabelled activities are left out.
        switch (kind) {
            case STRONG_MATCH:
                matchLabels[rec.slug] = { kind, patternId: patternId!, sharedActivityTypesByMotivation }
                break
            case PERSONALITY_MATCH:
                matchLabels[rec.slug] = { kind, patternId: patternId! }
                break
            case MOTIVATION_MATCH:
            case GOOD_MATCH:
                matchLabels[rec.slug] = { kind, sharedActivityTypesByMotivation }
                break
        }
    })
    return matchLabels
}

/*
 * Match label kind: which label an activity's conditions earn. The first that applies wins:
 * 1. "strong" — strong personality and strong motivation.
 * 2. "personality" — strong personality, whether or not it's high scoring.
 * 3. "motivation" — strong motivation.
 * 4. "good" — any other good match, so every label has a reason to show.
 * Anything else gets no label.
 */
function getMatchLabelKind(
    strongPersonality: boolean,
    strongMotivation: boolean,
    goodMatch: boolean,
): MatchLabel["kind"] | null {
    if (strongPersonality && strongMotivation) return STRONG_MATCH
    if (strongPersonality) return PERSONALITY_MATCH
    if (strongMotivation) return MOTIVATION_MATCH
    if (goodMatch) return GOOD_MATCH
    return null
}

/*
 * Strong personality: the activity passes both personality checks.
 * 1. Top personality fit — its base score (how well its patterns as a whole fit the user) is over one SD above their average,
 *    which keeps roughly the top sixth of the catalogue. See getHighBaseScoreActivities.
 * 2. High-scoring pattern — the user has a strong trait connected to it: a dominant pattern of at least MIN_DOMINANT_WEIGHT
 *    (0.6). Most activities pass this for a user with a few strong traits, so on its own it doesn't single any out.
 * Each catches what the other misses: middling users pass check 1 with nothing high, and users with a few strong traits pass
 * check 2 on nearly every activity. Together they keep "You scored highly as …" true.
 */
function isStrongPersonality(isTopPersonalityFit: boolean, dominantPatternId: PatternTypeId | null): boolean {
    return isTopPersonalityFit && dominantPatternId !== null
}

/*
 * Strong motivation: high scoring, and two or more of the user's motivations share a type with the activity.
 * Limited to high scoring activities because every activity overlaps at least two of the seven motivations.
 */
function isStrongMotivation(isHighScoring: boolean, overlappingMotivationCount: number): boolean {
    return isHighScoring && overlappingMotivationCount >= STRONG_MOTIVATION_MIN_OVERLAPS
}

/*
 * Good match: high scoring, and at least one of the user's motivations shares a type with the activity,
 * so the label always has a motivation reason to show.
 */
function isGoodMatch(isHighScoring: boolean, overlappingMotivationCount: number): boolean {
    return isHighScoring && overlappingMotivationCount >= 1
}
