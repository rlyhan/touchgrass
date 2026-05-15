import { ActivityType, Motivation, PatternTypeId, Recommendation } from '@touchgrass/types'
import { ACTIVITY_TYPE_PATTERNS } from '@touchgrass/types/constants'
import { getAdjacentPatterns, MATCH_WEIGHTS } from './patterns.js'

/*
 * Calculate a boosting factor for a recommendation based on the user's motivations.
 * Resolves motivation-relevant patterns for the activity, then finds exact and adjacent
 * matches against the user's pattern weights, applies weights, and normalises the result.
 */
export function calculateMotivationBoost(
    userPatternWeights: Record<PatternTypeId, number>,
    activity: Recommendation,
    motivations: Motivation[],
    normalizationFactor = 5,
) {
    const patterns = getMotivationPatterns({ activity, motivations })
    if (patterns.length === 0) return 0

    let exactBoost = 0
    let adjacentBoost = 0

    patterns.forEach((targetPatternId) => {
        if (userPatternWeights[targetPatternId] !== undefined) {
            exactBoost += userPatternWeights[targetPatternId] * MATCH_WEIGHTS.EXACT
            return
        }

        const adjacentPatterns = getAdjacentPatterns(targetPatternId)
        adjacentPatterns.forEach((adjacent) => {
            const userScore = userPatternWeights[adjacent.patternId]
            if (!userScore) return
            adjacentBoost += userScore * adjacent.weight
        })
    })

    return (exactBoost + adjacentBoost) / normalizationFactor
}

export function getMotivationActivityTypes(motivations: Motivation[]): ActivityType[] {
    return [...new Set(motivations.flatMap((m) => m.associated_activity_types))]
}

/* 
 * Gets patterns from the activity's types + related types.
 * Compares with patterns from associated types of motivations.
 */
export function getMotivationPatterns({
    activity,
    motivations,
}: {
    activity: Recommendation
    motivations: Motivation[]
}): PatternTypeId[] {
    const motivationTypes = getMotivationActivityTypes(motivations)

    const matchingTypes = [
        activity.type,
        ...(activity.related_types || []),
    ].filter((type) => motivationTypes.includes(type))

    const motivationPatterns = matchingTypes.flatMap(
        (type) => ACTIVITY_TYPE_PATTERNS[type] || []
    )

    return [...new Set(motivationPatterns)]
}
