import { BFASScores, OCEANScores, PatternType } from '@touchgrass/types';
import { patternTypes } from '@touchgrass/types/constants';

export const getOCEANScores = (bfas: BFASScores): OCEANScores => {
    return {
        Openness:
            (bfas.Openness + bfas.Intellect) / 2,

        Extraversion:
            (bfas.Enthusiasm + bfas.Assertiveness) / 2,

        Agreeableness:
            (bfas.Compassion + bfas.Politeness) / 2,

        Neuroticism:
            (bfas.Volatility + bfas.Withdrawal) / 2,

        Conscientiousness:
            (bfas.Industriousness + bfas.Orderliness) / 2,
    }
}

export function calculatePatternStrength(
    userOcean: OCEANScores,
    pattern: PatternType
): number {
    const traitA =
        userOcean[pattern.traitA.trait]
    const traitB =
        userOcean[pattern.traitB.trait]

    const traitAFit =
        pattern.traitA.level === 'H'
            ? traitA / 100
            : 1 - traitA / 100

    const traitBFit =
        pattern.traitB.level === 'H'
            ? traitB / 100
            : 1 - traitB / 100

    return (traitAFit + traitBFit) / 2
}

export const getUserPatternStrengths = (userOcean: OCEANScores): Record<PatternType['id'], number> => {
    const strengths: Record<PatternType['id'], number> = {} as Record<PatternType['id'], number>
    patternTypes.forEach(pattern => {
        strengths[pattern.id] = calculatePatternStrength(userOcean, pattern)
    })
    return strengths
}

export function calculateActivityPatternAffinity(
    userPatternStrengths: Record<PatternType['id'], number>,
    activityPatterns: PatternType['id'][]
): number {

    if (!activityPatterns.length) return 0

    let total = 0

    for (const patternId of activityPatterns) {
        total += userPatternStrengths[patternId] ?? 0
    }

    return total / activityPatterns.length
}

