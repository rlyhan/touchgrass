import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { Activity } from "@touchgrass/types"

import { apiUrl } from "@/lib/config"

export type SearchPage = {
  items: Activity[]
  total: number
}

// Mock-backed until browse moves to the API; signature mirrors the planned
// GET /activities/random endpoint.
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
  const params = new URLSearchParams({
    q: query.trim(),
    offset: String(offset),
    limit: String(limit),
  })
  const response = await fetch(apiUrl(`/activities/search?${params}`))

  if (!response.ok) {
    throw new Error(`Failed to search activities (${response.status})`)
  }
  return (await response.json()) as SearchPage
}
