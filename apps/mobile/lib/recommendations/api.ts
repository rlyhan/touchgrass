import type { Recommendation } from "@touchgrass/types"

import { authedFetch } from "@/lib/auth/fetch"

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  // eslint-disable-next-line no-undef
  (__DEV__ ? "http://localhost:3000" : (() => { throw new Error("EXPO_PUBLIC_API_BASE_URL must be set in production builds") })())

export class ProfileNotFoundError extends Error {
  constructor() {
    super("Profile not found")
    this.name = "ProfileNotFoundError"
  }
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  const response = await authedFetch(`${API_BASE_URL}/recommendations`)

  if (response.status === 404) {
    throw new ProfileNotFoundError()
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations (${response.status})`)
  }

  const body = (await response.json()) as { recommendations: Recommendation[] }
  return body.recommendations ?? []
}
