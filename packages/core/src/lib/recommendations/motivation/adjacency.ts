import { PatternType, PatternTypeId } from '@touchgrass/types'
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
export function getAdjacentPatterns(targetPatternTypeId: PatternTypeId) {
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

            return { patternId: candidate.id, weight }
        })
        .filter((t) => t.weight > 0)
}
