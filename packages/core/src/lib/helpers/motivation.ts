import { Activity, ActivityType, Motivation, PatternTypeId } from '@touchgrass/types'
import { ACTIVITY_TYPE_PATTERNS } from '@touchgrass/types/constants'
import { getAdjacentPatterns, MATCH_WEIGHTS } from './patterns.js'

/*
 * Calculates score boost based on alignment between user pattern weights and the patterns
 * shared by an activity and the selected motivation(s).
 *
 * 1. Gets the set of patterns shared between the activity's primary + secondary types and
 * the activity types linked to motivations.
 *
 * Example: User selects "Explore new experiences and adventure"
 * - Activity's types: Exploratory (primary), Social + Reflective (secondary)
 * - Motivation's associated types: [Adventurous, Outdoorsy, Exploratory, Experimental]
 * - Shared subset: [4-HH, 10-LH, 7-HH, 3-HL]
 *
 * 2. For each shared target pattern, sums:
 *   - userWeight[target] × 1.0 (exact)
 *   - userWeight[adjacent] × 0.65 for each distance-1 neighbour (strong adjacent)
 *   - userWeight[adjacent] × 0.5 for each distance-2 neighbour (weak adjacent)
 *
 * Below-threshold weights still contribute, but proportionally less — so the natural
 * weight does the lifting without an explicit dampening factor.
 *
 * The sum is divided by normalizationFactor (default 5) so the boost stays modest
 * compared to the base score.
 */
export function calculateMotivationBoost(
    userPatternWeights: Record<PatternTypeId, number>,
    activity: Activity,
    motivations: Motivation[],
    normalizationFactor = 5,
): number {
    const motivationActivitySharedPatterns = getMotivationAndActivitySharedPatterns({ activity, motivations })
    if (motivationActivitySharedPatterns.length === 0) return 0

    let exactBoost = 0
    let adjacentBoost = 0

    motivationActivitySharedPatterns.forEach((targetPatternId) => {
        const targetWeight = userPatternWeights[targetPatternId] ?? 0
        exactBoost += targetWeight * MATCH_WEIGHTS.EXACT

        getAdjacentPatterns(targetPatternId).forEach((adjacent) => {
            const adjacentWeight = userPatternWeights[adjacent.patternId] ?? 0
            adjacentBoost += adjacentWeight * adjacent.weight
        })
    })

    return (exactBoost + adjacentBoost) / normalizationFactor
}

export function getMotivationActivityTypes(motivations: Motivation[]): ActivityType[] {
    return [...new Set(motivations.flatMap((m) => m.associated_activity_types))]
}

/*
 * Identifies the matching set of patterns associated with activity's primary + secondary types and
 * the patterns associated with the activity types linked to motivations.
 *
 * eg. "Spend a Month Visiting Antique Markets"
 * - type: Exploratory (patterns 4-HH, 10-LH, 7-HH)
 * - related_types: Social (patterns 1-HH, 3-HL, 6-HL), Reflective (patterns 4LH, 10HH, 6HH)
 *
 * If user has selected "Explore new experiences and adventure" motivation, where its
 * associated types are:
 *
 * Adventurous (patterns 3-HH, 3-LH, 3-HL)
 * Outdoorsy (patterns 5-HH, 5-LH, 5-HL)
 * Exploratory (patterns 4-HH, 10-LH, 7-HH)
 * Experimental (patterns 9-HH, 9-LH, 9-HL)
 *
 * Matching patterns:
 * - From primary type "Exploratory": 4-HH, 10-LH, 7-HH
 * - From related type "Social": 3-HL
 * - From related type "Reflective": None
 *
 */
export function getMotivationAndActivitySharedPatterns({
    activity,
    motivations,
}: {
    activity: Activity
    motivations: Motivation[]
}): PatternTypeId[] {
    const motivationTypes = getMotivationActivityTypes(motivations)

    const matchingTypes = [
        activity.type,
        ...(activity.related_types || []),
    ].filter((type) => motivationTypes.includes(type))

    const sharedPatterns = matchingTypes.flatMap(
        (type) => ACTIVITY_TYPE_PATTERNS[type] || []
    )

    return [...new Set(sharedPatterns)]
}
