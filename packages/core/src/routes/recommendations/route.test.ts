import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { RecommendationsResponse } from "@touchgrass/types"
import { PATTERN_TYPES } from "@touchgrass/types/constants"
import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"

import { createMocks } from "../../test-utils/mocks.js"
import { AUTH_USER_ID, makeProfile } from "../../test-utils/profile.js"
import { setupTestApp } from "../../test-utils/test-app.js"

const fakeProfile = makeProfile()

const mocks = createMocks({
  getProfileByAuthUserId: async () => fakeProfile,
  loadActivities: async () => RECOMMENDATIONS,
})
const { getSessionUserId, getProfileByAuthUserId } = mocks
const api = setupTestApp(mocks)

test("GET /recommendations returns 200 with recommendations for the signed-in user", async () => {
  const res = await fetch(`${api.baseUrl}/recommendations`)

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

test("GET /recommendations includes patternWeights for all 40 patterns in [0, 1]", async () => {
  const res = await fetch(`${api.baseUrl}/recommendations`)
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

test("GET /recommendations only labels activities from the pool, labelling the recommendations screen's activities recommended", async () => {
  const res = await fetch(`${api.baseUrl}/recommendations`)
  const body = (await res.json()) as RecommendationsResponse

  const poolSlugs = new Set(RECOMMENDATIONS.map((a) => a.slug))
  assert.ok(Object.keys(body.matchLabels).every((slug) => poolSlugs.has(slug)))
  assert.ok(body.recommendations.length > 0)
  assert.ok(body.recommendations.every((a) => body.matchLabels[a.slug]?.kind === "recommended"))
})

test("GET /recommendations includes the user's onboarding interests, dropping any that aren't activity fields", async () => {
  getProfileByAuthUserId.mock.mockImplementation(async () => ({
    ...fakeProfile,
    interests: ["Music", "Not A Field", "Coding"],
  }))

  const res = await fetch(`${api.baseUrl}/recommendations`)
  const body = (await res.json()) as RecommendationsResponse

  assert.deepEqual(body.interests, ["Music", "Coding"])
})

test("GET /recommendations returns 401 when there is no session", async () => {
  getSessionUserId.mock.mockImplementation(async () => null)

  const res = await fetch(`${api.baseUrl}/recommendations`)

  assert.equal(res.status, 401)
  assert.equal(getProfileByAuthUserId.mock.callCount(), 0)
})

test("GET /recommendations returns 404 when the user has no profile yet", async () => {
  getProfileByAuthUserId.mock.mockImplementation(async () => null)

  const res = await fetch(`${api.baseUrl}/recommendations`)

  assert.equal(res.status, 404)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Profile not found")
})

test("GET /recommendations returns 500 when getSessionUserId throws", async () => {
  getSessionUserId.mock.mockImplementation(async () => {
    throw new Error("session lookup failed")
  })

  const res = await fetch(`${api.baseUrl}/recommendations`)

  assert.equal(res.status, 500)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Internal server error")
})

test("GET /recommendations returns 500 when the lookup fails", async () => {
  getProfileByAuthUserId.mock.mockImplementation(async () => {
    throw new Error("db down")
  })

  const res = await fetch(`${api.baseUrl}/recommendations`)

  assert.equal(res.status, 500)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Internal server error")
})

test("GET /recommendations returns 500 when the DB layer rejects malformed personality", async () => {
  // The real db/queries layer parses jsonb personality with Zod and throws on
  // malformed rows, so a corrupted jsonb value surfaces as a thrown error here.
  getProfileByAuthUserId.mock.mockImplementation(async () => {
    throw new Error("Invalid personality")
  })

  const res = await fetch(`${api.baseUrl}/recommendations`)

  assert.equal(res.status, 500)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Internal server error")
})
