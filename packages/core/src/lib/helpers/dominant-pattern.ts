import type { Activity, PatternTypeId } from "@touchgrass/types"
import { ACTIVITY_TYPE_PATTERNS } from "@touchgrass/types/constants"

/*
 * Returns the pattern ID with the highest user weight from the activity's
 * primary + related patterns, or null if none resolve. Ties resolve by
 * pattern ID string sort for determinism.
 */
export function getDominantPatternId(
    userPatternWeights: Record<PatternTypeId, number>,
    activity: Pick<Activity, "type" | "related_types">,
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
    return best
}
