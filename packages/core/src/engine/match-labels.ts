import type { Activity, MatchLabel, Motivation, PatternTypeId } from "@touchgrass/types"
import { getDominantPatternId } from "./personality/dominant-pattern.js"
import { getSharedActivityTypesBetweenActivityAndUserMotivations } from "./motivation/shared-activity-types.js"
import { getHighBaseScoreActivities } from "./personality/high-base-score.js"
import { isStrongPersonality } from "./personality/strong-personality.js"
import { getSlugSet } from "./utils.js"

// Match labels browse shows for each activity: which label it earns, and the reasons it carries.

const RECOMMENDED_MATCH = "recommended"
const PERSONALITY_MATCH = "personality"

/*
 * Match labels: the label browse gives for each activity, keyed by slug, chosen by getMatchLabelKind.
 * Each label carries its reasons: the user's best pattern when the activity is a strong personality match, each
 * overlapping motivation (by value) with the activity types it shares, and whether the recommendations screen picked it
 * for variety (its type's best pick). Activities with no label are left out.
 */
export function getMatchLabels(
    activities: Activity[],
    userMotivations: Motivation[],
    userPatternWeights: Record<PatternTypeId, number>,
    recommendedSlugSet: Set<string>,
    varietyPickSlugSet: Set<string>,
): Record<string, MatchLabel> {
    const topPersonalityFitSlugSet = getSlugSet(getHighBaseScoreActivities(userPatternWeights, activities))
    const matchLabels: Record<string, MatchLabel> = {}
    activities.forEach((rec) => {
        // Check whether it's a strong personality match, then pick the label; unlabelled activities are left out.
        const patternId = getDominantPatternId(userPatternWeights, rec)
        const strongPersonality = isStrongPersonality(topPersonalityFitSlugSet.has(rec.slug), patternId)
        const kind = getMatchLabelKind(recommendedSlugSet.has(rec.slug), strongPersonality)
        if (!kind) return

        // Attach the reasons: the personality pattern only for strong personality matches, any shared motivations, and
        // whether it was picked for variety.
        const sharedActivityTypesByMotivation = getSharedActivityTypesBetweenActivityAndUserMotivations(rec, userMotivations)
        matchLabels[rec.slug] = {
            kind,
            ...(strongPersonality ? { patternId: patternId! } : {}),
            sharedActivityTypesByMotivation,
            ...(varietyPickSlugSet.has(rec.slug) ? { pickedForVariety: true } : {}),
        }
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
