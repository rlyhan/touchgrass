import { BFASScores, OCEANScores, PatternType, PatternTypeId } from '@touchgrass/types'
import { PATTERN_TYPES } from '@touchgrass/types/constants'
import { getOCEANScores } from './ocean.js'

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

/* Calculates pattern weights for all 40 NEO patterns based on user's OCEAN scores */
export const getUserPatternWeights = (userOcean: OCEANScores): Record<PatternType['id'], number> => {
    const weights: Record<PatternType['id'], number> = {} as Record<PatternType['id'], number>
    PATTERN_TYPES.forEach((pattern) => {
        weights[pattern.id] = calculatePatternStrength(userOcean, pattern)
    })
    return weights
}

/* Calculates pattern weights for all 40 NEO patterns straight from a user's BFAS scores (BFAS → OCEAN → pattern weights). */
export const getUserPatternWeightsFromBfas = (userBfas: BFASScores): Record<PatternType['id'], number> =>
    getUserPatternWeights(getOCEANScores(userBfas))

/*
 * Averages a user's pattern weights across a set of activity patterns.
 * eg. Exploratory patterns ['4-HH', '9-HH', '7-LH'] → user weights 0.48, 0.70, 0.46 → affinity 0.5475
 */
export function calculateActivityPatternAffinity(
    userPatternWeights: Record<PatternTypeId, number>,
    activityPatterns: PatternType['id'][]
): number {
    if (!activityPatterns.length) return 0

    let total = 0
    for (const patternId of activityPatterns) {
        total += userPatternWeights[patternId] ?? 0
    }

    return total / activityPatterns.length
}
