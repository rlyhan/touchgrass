import { useEffect } from "react"

import { fetchRecommendations } from "@/lib/recommendations/api"
import { useMatchLabels } from "@/lib/recommendations/recommendation-store"

// Pages opened by a link or after a restart start with an empty store, so match labels and reasons
// would be missing. This loads recommendations once to fill it; failures only warn in dev.
export function useLoadRecommendationsIfMissing(): void {
  const hasRecommendations = Object.keys(useMatchLabels()).length > 0

  useEffect(() => {
    if (hasRecommendations) return
    fetchRecommendations().catch((err) => {
      if (__DEV__) console.warn("Couldn't load recommendations", err)
    })
  }, [hasRecommendations])
}
