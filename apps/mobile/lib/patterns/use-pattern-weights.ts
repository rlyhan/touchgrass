import { useEffect, useState } from "react"

import type { UserPatternWeights } from "@touchgrass/types"

import { fetchPatternWeights } from "./api"
import { getCachedPatternWeights } from "./cache"

type Status = "loading" | "ready" | "error"

type UsePatternWeightsResult = {
  weights: UserPatternWeights | undefined
  status: Status
}

/*
 * Returns the cached user pattern weights when available; on cache miss,
 * triggers a fetch and reports loading/error state. Once weights land in the
 * cache they're shared across all consumers via the module-level cache.
 */
export function usePatternWeights(): UsePatternWeightsResult {
  const [weights, setWeights] = useState<UserPatternWeights | undefined>(
    () => getCachedPatternWeights(),
  )
  const [status, setStatus] = useState<Status>(
    () => (getCachedPatternWeights() ? "ready" : "loading"),
  )

  useEffect(() => {
    if (weights) return
    let cancelled = false
    fetchPatternWeights()
      .then((w) => {
        if (cancelled) return
        setWeights(w)
        setStatus("ready")
      })
      .catch(() => {
        if (cancelled) return
        setStatus("error")
      })
    return () => {
      cancelled = true
    }
  }, [weights])

  return { weights, status }
}
