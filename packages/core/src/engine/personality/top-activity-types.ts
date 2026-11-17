import { BFASScores, ScoredActivityType } from "@touchgrass/types";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_PATTERNS } from "@touchgrass/types/constants";
import { calculateActivityPatternAffinity, getUserPatternWeightsFromBfas } from "./patterns.js";

const TOP_ACTIVITY_TYPES_COUNT = 6

/* Returns the top-scoring activity types for a user based on their BFAS traits. */
export function getTopActivityTypes(
    userTraits: BFASScores,
    count: number = TOP_ACTIVITY_TYPES_COUNT,
): ScoredActivityType[] {
    const userPatternWeights = getUserPatternWeightsFromBfas(userTraits)

    const scored: ScoredActivityType[] = ACTIVITY_TYPES.map((type) => ({
        type,
        score: calculateActivityPatternAffinity(
            userPatternWeights,
            ACTIVITY_TYPE_PATTERNS[type] ?? [],
        ),
    }))

    scored.sort((a, b) => b.score - a.score)

    return scored.slice(0, count)
}
