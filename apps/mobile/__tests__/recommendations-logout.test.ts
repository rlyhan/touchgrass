// Per-user recommendation data must never outlive a logout, even when a request is still in flight.
// Only the helpers below know how recommendations are fetched, cleared and read; the tests describe
// behaviour, so moving to another data layer (e.g. TanStack Query) means rewriting just the helpers.
jest.mock("@/lib/auth/fetch", () => ({
  authedFetch: jest.fn(),
}))

jest.mock("@/lib/config", () => ({
  apiUrl: (path: string) => `http://test${path}`,
}))

import { renderHook } from "@testing-library/react-native"
import type { ActivityField, PatternTypeId, RecommendationsResponse } from "@touchgrass/types"

import { authedFetch } from "@/lib/auth/fetch"
import { clearPatternWeightsCache, getCachedPatternWeights } from "@/lib/patterns/cache"
import { fetchRecommendations } from "@/lib/recommendations/api"
import {
  clearRecommendedSlugs,
  useDominantPatternIds,
  useInterests,
  useMatchLabels,
  useRecommendedSlugs,
} from "@/lib/recommendations/recommended-slugs"

const mockAuthedFetch = jest.mocked(authedFetch)

function responseFor(slug: string, patternId: PatternTypeId, interest: ActivityField): RecommendationsResponse {
  return {
    recommendations: [{ slug, dominantPatternId: patternId }],
    recommendedSlugs: [slug],
    matchLabels: { [slug]: { kind: "personality", patternId } },
    patternWeights: { [patternId]: 1 },
    interests: [interest],
  } as unknown as RecommendationsResponse
}

function serverReply(body: RecommendationsResponse): Response {
  return { status: 200, ok: true, json: async () => body } as unknown as Response
}

// Starts a request whose reply is held back until `respond` is called.
function startRecommendationsRequest() {
  let reply!: (response: Response) => void
  mockAuthedFetch.mockReturnValueOnce(new Promise<Response>((resolve) => (reply = resolve)))
  const done = fetchRecommendations()
  return async (body: RecommendationsResponse) => {
    reply(serverReply(body))
    await done
  }
}

async function loadRecommendations(body: RecommendationsResponse) {
  mockAuthedFetch.mockResolvedValueOnce(serverReply(body))
  await fetchRecommendations()
}

function logOut() {
  clearPatternWeightsCache()
  clearRecommendedSlugs()
}

function readRecommendationState() {
  const { result } = renderHook(() => ({
    slugs: [...useRecommendedSlugs()],
    matchLabels: useMatchLabels(),
    dominantPatternIds: useDominantPatternIds(),
    interests: [...useInterests()],
  }))
  return { ...result.current, patternWeights: getCachedPatternWeights() }
}

const userA = responseFor("pottery", "1-HH", "Art")
const userB = responseFor("climbing", "2-LL", "Sports")

beforeEach(() => {
  mockAuthedFetch.mockReset()
  logOut()
})

describe("recommendations across logout", () => {
  it("shows the loaded user's recommendations", async () => {
    await loadRecommendations(userA)

    expect(readRecommendationState()).toEqual({
      slugs: ["pottery"],
      matchLabels: { pottery: { kind: "personality", patternId: "1-HH" } },
      dominantPatternIds: { pottery: "1-HH" },
      interests: ["Art"],
      patternWeights: { "1-HH": 1 },
    })
  })

  it("forgets everything on logout", async () => {
    await loadRecommendations(userA)

    logOut()

    expect(readRecommendationState()).toEqual({
      slugs: [],
      matchLabels: {},
      dominantPatternIds: {},
      interests: [],
      patternWeights: undefined,
    })
  })

  it("ignores a reply to a request started before logout", async () => {
    const respond = startRecommendationsRequest()

    logOut()
    await respond(userA)

    expect(readRecommendationState()).toEqual({
      slugs: [],
      matchLabels: {},
      dominantPatternIds: {},
      interests: [],
      patternWeights: undefined,
    })
  })

  it("keeps the next user's recommendations when the previous user's reply arrives late", async () => {
    const respondToA = startRecommendationsRequest()

    logOut()
    await loadRecommendations(userB)
    await respondToA(userA)

    expect(readRecommendationState()).toEqual({
      slugs: ["climbing"],
      matchLabels: { climbing: { kind: "personality", patternId: "2-LL" } },
      dominantPatternIds: { climbing: "2-LL" },
      interests: ["Sports"],
      patternWeights: { "2-LL": 1 },
    })
  })
})
