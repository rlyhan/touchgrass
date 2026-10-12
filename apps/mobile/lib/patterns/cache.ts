import type { UserPatternWeights } from "@touchgrass/types"

let patternWeights: UserPatternWeights | undefined

export function getCachedPatternWeights(): UserPatternWeights | undefined {
  return patternWeights
}

export function setCachedPatternWeights(weights: UserPatternWeights): void {
  patternWeights = weights
}

export function clearPatternWeightsCache(): void {
  patternWeights = undefined
}
