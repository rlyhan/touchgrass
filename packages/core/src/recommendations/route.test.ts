import { strict as assert } from "node:assert"
import type { Server } from "node:http"
import type { AddressInfo } from "node:net"
import { after, before, beforeEach, mock, test } from "node:test"

import type { Request } from "express"

import type {
  Activity,
  PatternTypeId,
  RecommendationsResponse,
} from "@touchgrass/types"
import { PATTERN_TYPES } from "@touchgrass/types/constants"
import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"

import { createApp } from "../app.js"
import type { NewProfile, Profile } from "../db/schema.js"

const AUTH_USER_ID = "auth_user_abc"

const fakeProfile: Profile = {
  id: "00000000-0000-0000-0000-000000000001",
  authUserId: AUTH_USER_ID,
  name: "Ada Lovelace",
  birthdate: "1990-04-12",
  heightCm: 172,
  gender: "Female",
  build: "Athletic",
  location: "London",
  employment: "Employed",
  interests: ["Music", "Coding"],
  personality: {
    Openness: 97,
    Intellect: 61,
    Industriousness: 63,
    Orderliness: 60,
    Enthusiasm: 16,
    Assertiveness: 19,
    Compassion: 91,
    Politeness: 83,
    Volatility: 68,
    Withdrawal: 63,
  },
  motivations: ["explore_creative", "learn_think_grow"],
  createdAt: new Date("2026-01-01T00:00:00Z"),
}

const insertProfile = mock.fn<(newProfile: NewProfile) => Promise<Profile>>(
  async () => fakeProfile,
)
const getProfileByAuthUserId = mock.fn<
  (authUserId: string) => Promise<Profile | null>
>(async () => fakeProfile)
const getSessionUserId = mock.fn<(req: Request) => Promise<string | null>>(
  async () => AUTH_USER_ID,
)
const loadRecommendations = mock.fn<() => Promise<Activity[]>>(
  async () => RECOMMENDATIONS,
)

let server: Server
let baseUrl: string

before(() => {
  const app = createApp(
    {
      insertProfile,
      getProfileByAuthUserId,
      getSessionUserId,
      loadRecommendations,
      getActivityBySlug: async () => null,
    },
    { disableRateLimits: true },
  )
  server = app.listen(0)
  const { port } = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${port}`
})

after(() => {
  server.close()
})

beforeEach(() => {
  getProfileByAuthUserId.mock.resetCalls()
  getProfileByAuthUserId.mock.mockImplementation(async () => fakeProfile)
  getSessionUserId.mock.resetCalls()
  getSessionUserId.mock.mockImplementation(async () => AUTH_USER_ID)
})

test("GET /recommendations returns 200 with recommendations for the signed-in user", async () => {
  const res = await fetch(`${baseUrl}/recommendations`)

  assert.equal(res.status, 200)
  const body = (await res.json()) as RecommendationsResponse
  assert.ok(Array.isArray(body.recommendations))
  assert.ok(body.recommendations.length > 0)
  for (const rec of body.recommendations) {
    assert.ok(typeof rec.slug === "string")
    assert.ok(typeof rec.title === "string")
  }

  assert.equal(getProfileByAuthUserId.mock.callCount(), 1)
  assert.equal(getProfileByAuthUserId.mock.calls[0]?.arguments[0], AUTH_USER_ID)
})

test("GET /recommendations includes a dominantPatternId on every recommendation", async () => {
  const res = await fetch(`${baseUrl}/recommendations`)
  const body = (await res.json()) as RecommendationsResponse

  const validIds = new Set<PatternTypeId>(PATTERN_TYPES.map((p) => p.id))
  for (const rec of body.recommendations) {
    assert.ok(
      rec.dominantPatternId === null || validIds.has(rec.dominantPatternId),
      `expected valid pattern id or null, got ${rec.dominantPatternId}`,
    )
  }
})

test("GET /recommendations includes patternWeights for all 40 patterns in [0, 1]", async () => {
  const res = await fetch(`${baseUrl}/recommendations`)
  const body = (await res.json()) as RecommendationsResponse

  assert.equal(Object.keys(body.patternWeights).length, 40)
  for (const pattern of PATTERN_TYPES) {
    const weight = body.patternWeights[pattern.id]
    assert.ok(
      typeof weight === "number" && weight >= 0 && weight <= 1,
      `expected weight in [0,1] for ${pattern.id}, got ${weight}`,
    )
  }
})

test("GET /recommendations returns 401 when there is no session", async () => {
  getSessionUserId.mock.mockImplementation(async () => null)

  const res = await fetch(`${baseUrl}/recommendations`)

  assert.equal(res.status, 401)
  assert.equal(getProfileByAuthUserId.mock.callCount(), 0)
})

test("GET /recommendations returns 404 when the user has no profile yet", async () => {
  getProfileByAuthUserId.mock.mockImplementation(async () => null)

  const res = await fetch(`${baseUrl}/recommendations`)

  assert.equal(res.status, 404)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Profile not found")
})

test("GET /recommendations returns 500 when getSessionUserId throws", async () => {
  getSessionUserId.mock.mockImplementation(async () => {
    throw new Error("session lookup failed")
  })

  const res = await fetch(`${baseUrl}/recommendations`)

  assert.equal(res.status, 500)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Internal server error")
})

test("GET /recommendations returns 500 when the lookup fails", async () => {
  getProfileByAuthUserId.mock.mockImplementation(async () => {
    throw new Error("db down")
  })

  const res = await fetch(`${baseUrl}/recommendations`)

  assert.equal(res.status, 500)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Internal server error")
})

test("GET /recommendations returns 500 when the DB layer rejects malformed personality", async () => {
  // The real db/profiles layer parses jsonb personality with Zod and throws on
  // malformed rows, so a corrupted jsonb value surfaces as a thrown error here.
  getProfileByAuthUserId.mock.mockImplementation(async () => {
    throw new Error("Invalid personality")
  })

  const res = await fetch(`${baseUrl}/recommendations`)

  assert.equal(res.status, 500)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Internal server error")
})
