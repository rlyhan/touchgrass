import type { Activity, ActivityDetail } from "@touchgrass/types"

import { authedFetch } from "@/lib/auth/fetch"

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  // eslint-disable-next-line no-undef
  (__DEV__ ? "http://localhost:3000" : (() => { throw new Error("EXPO_PUBLIC_API_BASE_URL must be set in production builds") })())

const activityCache = new Map<string, Activity>()

export function getCachedActivity(id: string): Activity | undefined {
  return activityCache.get(id)
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
  activities.forEach((a) => activityCache.set(a.id, a))
  return activities
}

export type ActivityDetailExtended = Pick<ActivityDetail, "aiSummary" | "description">

// TODO: replace mock with real API call once GET /recommendations/:id/detail is implemented
export async function fetchRecommendationDetail(id: string): Promise<ActivityDetailExtended> {
  void id
  // const response = await authedFetch(`${API_BASE_URL}/recommendations/${id}/detail`)
  // return response.json() as Promise<ActivityDetailExtended>
  return {
    aiSummary:
      "This activity was recommended because it aligns with your creative interests and fits well within your current energy and budget.",
    description:
      "This is a placeholder description. Once the detail endpoint is live, this will contain a full overview of the activity — what it involves, what you'll need, and how to get started.",
  }
}
