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
