import type { Activity, MatchLabel, Motivation, PatternTypeId } from "@touchgrass/types"
import { getDominantPatternId } from "@touchgrass/types/dominant-pattern"
import { getSharedActivityTypesBetweenActivityAndUserMotivations } from "./motivation/shared-activity-types.js"
import { getHighBaseScoreActivities, getSlugSet } from "./score.js"

// Match labels browse shows for each activity: which label it earns, and the reasons it carries.

const RECOMMENDED_MATCH = "recommended"
const PERSONALITY_MATCH = "personality"

/*
 * Match labels: the label browse gives for each activity, keyed by slug, chosen by getMatchLabelKind.
 * Each label carries its reasons: the user's best pattern when the activity is a strong personality match, and each
 * overlapping motivation (by value) with the activity types it shares. Activities with no label are left out.
 */
export function getMatchLabels(
    activities: Activity[],
    userMotivations: Motivation[],
    userPatternWeights: Record<PatternTypeId, number>,
    recommendedSlugSet: Set<string>,
): Record<string, MatchLabel> {
    const topPersonalityFitSlugSet = getSlugSet(getHighBaseScoreActivities(userPatternWeights, activities))
    const matchLabels: Record<string, MatchLabel> = {}
    activities.forEach((rec) => {
        // Check whether it's a strong personality match, then pick the label; unlabelled activities are left out.
        const patternId = getDominantPatternId(userPatternWeights, rec)
        const strongPersonality = isStrongPersonality(topPersonalityFitSlugSet.has(rec.slug), patternId)
        const kind = getMatchLabelKind(recommendedSlugSet.has(rec.slug), strongPersonality)
        if (!kind) return

        // Attach the reasons: the personality pattern only for strong personality matches, plus any shared motivations.
        const sharedActivityTypesByMotivation = getSharedActivityTypesBetweenActivityAndUserMotivations(rec, userMotivations)
        matchLabels[rec.slug] = strongPersonality
            ? { kind, patternId: patternId!, sharedActivityTypesByMotivation }
            : { kind, sharedActivityTypesByMotivation }
    })
    return matchLabels
}

/*
 * Match label kind: the first that applies wins.
 * 1. "recommended" — on the recommendations screen (the diversified top recommendations).
 * 2. "personality" — any other strong personality match.
 * Anything else gets no label.
 */
function getMatchLabelKind(isRecommended: boolean, strongPersonality: boolean): MatchLabel["kind"] | null {
    if (isRecommended) return RECOMMENDED_MATCH
    if (strongPersonality) return PERSONALITY_MATCH
    return null
}

/*
 * Strong personality: the activity passes both personality checks, so its page can say "You scored highly as …".
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
