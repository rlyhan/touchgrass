import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { Activity } from "@touchgrass/types"

export type SearchPage = {
  items: Activity[]
  total: number
}

function matchesQuery(activity: Activity, query: string): boolean {
  return [activity.title, activity.field, activity.type].some((value) =>
    value.toLowerCase().includes(query),
  )
}

// Mock-backed until browse moves to the API; signatures mirror the planned
// GET /activities/random and GET /activities/search?q=&offset=&limit= endpoints.
export async function fetchRandomActivities(count: number): Promise<Activity[]> {
  const picked = new Set<Activity>()
  while (picked.size < Math.min(count, RECOMMENDATIONS.length)) {
    picked.add(RECOMMENDATIONS[Math.floor(Math.random() * RECOMMENDATIONS.length)])
  }
  return Array.from(picked)
}

export async function searchActivities(
  query: string,
  { offset, limit }: { offset: number; limit: number },
): Promise<SearchPage> {
  const normalised = query.trim().toLowerCase()
  const matches = RECOMMENDATIONS.filter((activity) => matchesQuery(activity, normalised))
  return {
    items: matches.slice(offset, offset + limit),
    total: matches.length,
  }
}
