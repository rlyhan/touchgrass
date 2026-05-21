import type { Activity } from "@touchgrass/types"

import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"

// Sanity enforces title + slug as required; every other field may be null
// while an editor is mid-migration. The merge layer treats nulls as "fall
// through to the mock value" so partial Sanity docs don't break the UI.
export type SanityActivity = Partial<Activity> & Pick<Activity, "title" | "slug">

export type LoadRecommendations = () => Promise<Activity[]>
export type LoadSanityActivities = () => Promise<SanityActivity[]>

export function createRecommendationLoader(
  fetchFromSanity: LoadSanityActivities,
): LoadRecommendations {
  return async () => {
    const fromSanity = await fetchFromSanity()
    const sanityBySlug = new Map(fromSanity.map((s) => [s.slug, s]))
    const mockSlugs = new Set(RECOMMENDATIONS.map((m) => m.slug))

    const mergedMocks = RECOMMENDATIONS.map((mock) => {
      const sanity = sanityBySlug.get(mock.slug)
      return sanity ? mergeNonNull(mock, sanity) : mock
    })

    const sanityOnly = fromSanity
      .filter((s) => !mockSlugs.has(s.slug))
      .map((s) => s as Activity)

    return [...sanityOnly, ...mergedMocks]
  }
}

function mergeNonNull(base: Activity, override: SanityActivity): Activity {
  const result: Activity = { ...base }
  for (const key of Object.keys(override) as (keyof SanityActivity)[]) {
    const value = override[key]
    if (value !== null && value !== undefined) {
      // Casting is safe because each key on SanityActivity is a key on Activity
      // and the value type matches.
      ;(result as Record<string, unknown>)[key] = value
    }
  }
  return result
}
