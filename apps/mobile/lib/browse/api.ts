import type { Activity } from "@touchgrass/types"

import { apiUrl } from "@/lib/config"

export type SearchPage = {
  items: Activity[]
  total: number
}

export async function fetchRandomActivities(count: number): Promise<Activity[]> {
  const response = await fetch(apiUrl(`/activities/random?count=${count}`))

  if (!response.ok) {
    throw new Error(`Failed to fetch random activities (${response.status})`)
  }
  const body = (await response.json()) as { activities: Activity[] }
  return body.activities
}

export type SearchFilters = Record<string, string[]>

export async function searchActivities(
  query: string,
  filters: SearchFilters,
  { offset, limit }: { offset: number; limit: number },
): Promise<SearchPage> {
  const params = new URLSearchParams({
    q: query.trim(),
    offset: String(offset),
    limit: String(limit),
  })
  for (const [key, values] of Object.entries(filters)) {
    if (values.length) params.set(key, values.join(","))
  }
  const response = await fetch(apiUrl(`/activities/search?${params}`))

  if (!response.ok) {
    throw new Error(`Failed to search activities (${response.status})`)
  }
  return (await response.json()) as SearchPage
}
