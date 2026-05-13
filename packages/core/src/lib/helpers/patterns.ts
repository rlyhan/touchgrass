import { OCEANScores, PatternType, PatternTypeId } from '@touchgrass/types'
import { PATTERN_TYPES } from '@touchgrass/types/constants'

export const MATCH_WEIGHTS = {
    EXACT: 1.0,
    STRONG_ADJACENT: 0.65,
    WEAK_ADJACENT: 0.5,
}

/* Fetches a NEO pattern by id. eg. 1-HH for Group 1 (Extraversion × Agreeableness) with High E and High A. */
function getPatternById(id: PatternTypeId) {
    return PATTERN_TYPES.find((p: PatternType) => p.id === id)
}

/*
 * Calculates the distance between two NEO patterns based on how many trait polarities differ.
 * eg. 4-HL vs 4-HH → distance 1 (Extraversion differs), 4-HL vs 4-LL → distance 2 (both differ)
 */
export function calculatePatternDistance(a: PatternType, b: PatternType) {
    let distance = 0
    if (a.traitA.level !== b.traitA.level) distance += 1
    if (a.traitB.level !== b.traitB.level) distance += 1
    return distance
}

/* Returns patterns in the same group as the target, with their adjacency weights. eg. 4-HL → 4-HH (0.65), 4-LL (0.5) */
export function getAdjacentTraits(targetPatternTypeId: PatternTypeId) {
    const target = getPatternById(targetPatternTypeId)

    if (!target) return []

    return PATTERN_TYPES
        .filter((candidate: PatternType) => {
            if (candidate.id === target.id) return false
            return candidate.groupId === target.groupId
        })
        .map((candidate: PatternType) => {
            const distance = calculatePatternDistance(target, candidate)
            let weight = 0

            if (distance === 1) weight = MATCH_WEIGHTS.STRONG_ADJACENT
            else if (distance === 2) weight = MATCH_WEIGHTS.WEAK_ADJACENT

            return { traitId: candidate.id, weight }
        })
        .filter((t) => t.weight > 0)
}

/*
 * Calculates how well a user's OCEAN scores match a specific NEO pattern.
 * eg. Openness=80, Extraversion=30 vs 4-HH → 0.8 fit for high O, 0.7 fit for low E → avg 0.75
 */
export function calculatePatternStrength(
    userOcean: OCEANScores,
    pattern: PatternType
): number {
    const traitA = userOcean[pattern.traitA.trait]
    const traitB = userOcean[pattern.traitB.trait]

    const traitAFit = pattern.traitA.level === 'H' ? traitA / 100 : 1 - traitA / 100
    const traitBFit = pattern.traitB.level === 'H' ? traitB / 100 : 1 - traitB / 100

    return (traitAFit + traitBFit) / 2
}

/* Calculates pattern strengths for all 40 NEO patterns based on user's OCEAN scores */
export const getUserPatternStrengths = (userOcean: OCEANScores): Record<PatternType['id'], number> => {
    const strengths: Record<PatternType['id'], number> = {} as Record<PatternType['id'], number>
    PATTERN_TYPES.forEach((pattern) => {
        strengths[pattern.id] = calculatePatternStrength(userOcean, pattern)
    })
    return strengths
}

/*
 * Averages a user's pattern strengths across a set of activity patterns.
 * eg. Exploratory patterns ['4-HH', '9-HH', '7-LH'] → user strengths 0.48, 0.70, 0.46 → affinity 0.5475
 */
export function calculateActivityPatternAffinity(
    userPatternStrengths: Record<string, number>,
    activityPatterns: PatternType['id'][]
): number {
    if (!activityPatterns.length) return 0

    let total = 0
    for (const patternId of activityPatterns) {
        total += userPatternStrengths[patternId] ?? 0
    }

    return total / activityPatterns.length
}

