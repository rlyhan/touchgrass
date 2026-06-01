import type { PatternWeightsResponse } from "@touchgrass/types"

import { UnauthenticatedError } from "@/lib/auth/errors"
import { authedFetch } from "@/lib/auth/fetch"
import { apiUrl } from "@/lib/config"

import { setCachedPatternWeights } from "./cache"

export async function fetchPatternWeights(): Promise<
  PatternWeightsResponse["patternWeights"]
> {
  const response = await authedFetch(apiUrl("/pattern-weights"))

  if (response.status === 401) throw new UnauthenticatedError()
  if (!response.ok) {
    throw new Error(`Failed to fetch pattern weights (${response.status})`)
  }

  const body = (await response.json()) as PatternWeightsResponse
  setCachedPatternWeights(body.patternWeights)
  return body.patternWeights
}
