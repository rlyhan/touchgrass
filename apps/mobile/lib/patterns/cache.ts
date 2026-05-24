import type {
  Activity,
  PatternTypeId,
  UserPatternWeights,
} from "@touchgrass/types"

import {
  MIN_DOMINANT_WEIGHT,
  getDominantPatternId,
} from "@touchgrass/types/dominant-pattern"

let patternWeights: UserPatternWeights | undefined
const dominantPatternBySlug = new Map<string, PatternTypeId | null>()

export function getCachedPatternWeights(): UserPatternWeights | undefined {
  return patternWeights
}

export function setCachedPatternWeights(weights: UserPatternWeights): void {
  patternWeights = weights
}

export function clearPatternWeightsCache(): void {
  patternWeights = undefined
  dominantPatternBySlug.clear()
}

export function getCachedDominantPattern(
  slug: string,
): PatternTypeId | null | undefined {
  return dominantPatternBySlug.get(slug)
}

export function setCachedDominantPattern(
  slug: string,
  patternId: PatternTypeId | null,
): void {
  dominantPatternBySlug.set(slug, patternId)
}

/*
 * Resolves the dominant pattern for an activity. Prefers cached value (set by
 * the recommendations endpoint), falls back to client-side computation from
 * cached pattern weights. Returns null when weights are missing or no pattern
 * meets the threshold.
 */
export function resolveDominantPattern(
  activity: Pick<Activity, "slug" | "type" | "related_types">,
): PatternTypeId | null {
  const cached = dominantPatternBySlug.get(activity.slug)
  if (cached !== undefined) return cached
  if (!patternWeights) return null
  const computed = getDominantPatternId(
    patternWeights,
    activity,
    MIN_DOMINANT_WEIGHT,
  )
  dominantPatternBySlug.set(activity.slug, computed)
  return computed
}
