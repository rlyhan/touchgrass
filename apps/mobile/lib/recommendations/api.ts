import type { Recommendation } from "@touchgrass/types"

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000"

export async function fetchRecommendations(
  userId: string,
): Promise<Recommendation[]> {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/recommendations`,
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations (${response.status})`)
  }

  const body = (await response.json()) as { recommendations: Recommendation[] }
  return body.recommendations
}
