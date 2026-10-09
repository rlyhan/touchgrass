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

// Mock-backed until browse moves to the API; the signature mirrors the planned
// GET /activities/search?q=&offset=&limit= endpoint.
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
