import type { Activity, PatternTypeId } from "@touchgrass/types"
import { ACTIVITY_TYPE_PATTERNS } from "@touchgrass/types/constants"

// Minimum user weight required to claim the user "scored highly" for a pattern.
// Below this, dominant-pattern resolution returns null so the UI hides the match
// rationale rather than overclaiming.
export const MIN_DOMINANT_WEIGHT = 0.6

/*
 * Returns the pattern ID with the highest user weight from the activity's
 * primary + related patterns, or null if none meet `minWeight`. Ties resolve
 * by pattern ID string sort for determinism.
 */
export function getDominantPatternId(
    userPatternWeights: Record<PatternTypeId, number>,
    activity: Pick<Activity, "type" | "related_types">,
    minWeight: number = MIN_DOMINANT_WEIGHT,
): PatternTypeId | null {
    const primary = ACTIVITY_TYPE_PATTERNS[activity.type] ?? []
    const secondary = (activity.related_types ?? []).flatMap(
        (t) => ACTIVITY_TYPE_PATTERNS[t] ?? [],
    )
    const candidates = Array.from(new Set([...primary, ...secondary]))
    if (candidates.length === 0) return null

    let best: PatternTypeId | null = null
    let bestWeight = -Infinity
    for (const id of candidates) {
        const weight = userPatternWeights[id] ?? 0
        if (weight > bestWeight || (weight === bestWeight && best !== null && id < best)) {
            best = id
            bestWeight = weight
        }
    }

    if (best === null || bestWeight < minWeight) return null
    return best
}
