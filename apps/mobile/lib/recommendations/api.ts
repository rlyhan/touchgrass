import type { Activity } from "@touchgrass/types"

import { authedFetch } from "@/lib/auth/fetch"
import { API_BASE_URL } from "@/lib/config"

const activityCache = new Map<string, Activity>()

export function getCachedActivity(slug: string): Activity | undefined {
  return activityCache.get(slug)
}

export class ProfileNotFoundError extends Error {
  constructor() {
    super("Profile not found")
    this.name = "ProfileNotFoundError"
  }
}

export async function fetchRecommendations(): Promise<Activity[]> {
  const response = await authedFetch(`${API_BASE_URL}/recommendations`)

  if (response.status === 404) {
    throw new ProfileNotFoundError()
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations (${response.status})`)
  }

  const body = (await response.json()) as { recommendations: Activity[] }
  const activities = body.recommendations ?? []
  activities.forEach((a) => activityCache.set(a.slug, a))
  return activities
}

export async function fetchActivityBySlug(slug: string): Promise<Activity | null> {
  const response = await authedFetch(
    `${API_BASE_URL}/activities/${encodeURIComponent(slug)}`,
  )

  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`Failed to fetch activity (${response.status})`)
  }

  const body = (await response.json()) as { activity: Activity }
  activityCache.set(body.activity.slug, body.activity)
  return body.activity
}
