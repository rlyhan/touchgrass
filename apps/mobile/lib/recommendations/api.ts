import type { Activity, RecommendationsResponse } from "@touchgrass/types"

import { authedFetch } from "@/lib/auth/fetch"
import { apiUrl } from "@/lib/config"
import {
  setCachedDominantPattern,
  setCachedPatternWeights,
} from "@/lib/patterns/cache"

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
  const response = await authedFetch(apiUrl("/recommendations"))

  if (response.status === 404) {
    throw new ProfileNotFoundError()
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations (${response.status})`)
  }

  const body = (await response.json()) as RecommendationsResponse
  if (body.patternWeights) {
    setCachedPatternWeights(body.patternWeights)
  }
  const activities = body.recommendations ?? []
  activities.forEach((rec) => {
    activityCache.set(rec.slug, rec)
    setCachedDominantPattern(rec.slug, rec.dominantPatternId ?? null)
  })
  return activities
}

export async function fetchActivityBySlug(slug: string): Promise<Activity | null> {
  const response = await authedFetch(
    apiUrl(`/activities/${encodeURIComponent(slug)}`),
  )

  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`Failed to fetch activity (${response.status})`)
  }

  const body = (await response.json()) as { activity: Activity }
  activityCache.set(body.activity.slug, body.activity)
  return body.activity
}
