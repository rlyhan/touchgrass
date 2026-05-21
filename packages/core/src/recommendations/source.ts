import type { Activity } from "@touchgrass/types"

import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"

export type LoadRecommendations = () => Promise<Activity[]>

export function createRecommendationLoader(
  fetchFromSanity: LoadRecommendations,
): LoadRecommendations {
  return async () => {
    const fromSanity = await fetchFromSanity()
    const migratedSlugs = new Set(fromSanity.map((r) => r.slug))
    const remainingMocks = RECOMMENDATIONS.filter(
      (r) => !migratedSlugs.has(r.slug),
    )
    return [...fromSanity, ...remainingMocks]
  }
}
