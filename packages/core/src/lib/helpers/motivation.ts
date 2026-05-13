import { ActivityType, Motivation, PatternTypeId, Recommendation } from '@touchgrass/types'
import { ACTIVITY_TYPE_PATTERNS } from '@touchgrass/types/constants'
import { getAdjacentTraits, MATCH_WEIGHTS } from './patterns.js'

export function calculateMotivationBoost(
    userTraits: Record<string, number>,
    targetTraits: PatternTypeId[],
    normalizationFactor = 5,
) {
    let exactBoost = 0
    let adjacentBoost = 0

    targetTraits.forEach((targetTraitId) => {
        if (userTraits[targetTraitId] !== undefined) {
            exactBoost += userTraits[targetTraitId] * MATCH_WEIGHTS.EXACT
            return
        }

        const adjacentTraits = getAdjacentTraits(targetTraitId)
        adjacentTraits.forEach((adjacent) => {
            const userScore = userTraits[adjacent.traitId]
            if (!userScore) return
            adjacentBoost += userScore * adjacent.weight
        })
    })

    return (exactBoost + adjacentBoost) / normalizationFactor
}

export function getMotivationActivityTypes(motivations: Motivation[]): ActivityType[] {
    return [...new Set(motivations.flatMap((m) => m.associated_activity_types))]
}

export function getMotivationRelevantTraits({
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

    const targetTraits = matchingTypes.flatMap(
        (type) => ACTIVITY_TYPE_PATTERNS[type] || []
    )

    return [...new Set(targetTraits)]
}
