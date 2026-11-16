import { BFASScores, OCEANScores, PersonalityType } from '@touchgrass/types';
import { BFAS_TRAITS } from '@touchgrass/types/constants';

/**
 * Converts a set of Big Five Aspect Scale (BFAS) scores into OCEAN (Big Five) scores.
 *
 * BFAS breaks each of the five OCEAN traits into two more granular aspects — ten in
 * total. 
 * 
 * This function groups those aspects by their parent OCEAN trait (as declared in
 * BFAS_TRAITS) and averages each group to produce the five parent-level scores.
 *
 * Groupings are determined entirely by `BFAS_TRAITS[n].parent`, so adding, removing, or
 * re-parenting an aspect in constants flows through here automatically.
 */
export const getOCEANScores = (bfas: BFASScores): OCEANScores => {
    const sums: Partial<Record<PersonalityType, { total: number; count: number }>> = {}

    for (const trait of BFAS_TRAITS) {
        const parentKey = trait.parent.key
        const entry = sums[parentKey] ?? { total: 0, count: 0 }
        entry.total += bfas[trait.key]
        entry.count += 1
        sums[parentKey] = entry
    }

    return Object.fromEntries(
        Object.entries(sums).map(([key, { total, count }]) => [key, total / count])
    ) as OCEANScores
}
