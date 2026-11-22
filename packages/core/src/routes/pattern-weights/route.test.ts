import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { PatternWeightsResponse } from "@touchgrass/types"
import { PATTERN_TYPES } from "@touchgrass/types/constants"

import { createMocks } from "../../test-utils/mocks.js"
import { makeProfile } from "../../test-utils/profile.js"
import { setupTestApp } from "../../test-utils/test-app.js"

const fakeProfile = makeProfile({ interests: [], motivations: [] })

const mocks = createMocks({
  getProfileByAuthUserId: async () => fakeProfile,
})
const { getSessionUserId, getProfileByAuthUserId } = mocks
const api = setupTestApp(mocks)

test("GET /pattern-weights returns all 40 pattern weights in [0, 1]", async () => {
  const res = await fetch(`${api.baseUrl}/pattern-weights`)

  assert.equal(res.status, 200)
  const body = (await res.json()) as PatternWeightsResponse
  assert.equal(Object.keys(body.patternWeights).length, 40)
  for (const pattern of PATTERN_TYPES) {
    const weight = body.patternWeights[pattern.id]
    assert.ok(
      typeof weight === "number" && weight >= 0 && weight <= 1,
      `expected weight in [0,1] for ${pattern.id}, got ${weight}`,
    )
  }
})

test("GET /pattern-weights returns 401 when there is no session", async () => {
  getSessionUserId.mock.mockImplementation(async () => null)

  const res = await fetch(`${api.baseUrl}/pattern-weights`)

  assert.equal(res.status, 401)
  assert.equal(getProfileByAuthUserId.mock.callCount(), 0)
})

test("GET /pattern-weights returns 404 when the user has no profile yet", async () => {
  getProfileByAuthUserId.mock.mockImplementation(async () => null)

  const res = await fetch(`${api.baseUrl}/pattern-weights`)

  assert.equal(res.status, 404)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Profile not found")
})

test("GET /pattern-weights returns 500 when the lookup throws", async () => {
  getProfileByAuthUserId.mock.mockImplementation(async () => {
    throw new Error("db down")
  })

  const res = await fetch(`${api.baseUrl}/pattern-weights`)

  assert.equal(res.status, 500)
})
