import { strict as assert } from "node:assert"
import { beforeEach, mock, test } from "node:test"

import type { Request } from "express"

import type { PatternWeightsResponse } from "@touchgrass/types"
import { PATTERN_TYPES } from "@touchgrass/types/constants"

import { AUTH_USER_ID, makeProfile } from "../../test-utils/profile.js"
import { setupTestApp } from "../../test-utils/test-app.js"
import type { Profile } from "../../db/schema/index.js"

const fakeProfile = makeProfile({ interests: [], motivations: [] })

const getProfileByAuthUserId = mock.fn<
  (authUserId: string) => Promise<Profile | null>
>(async () => fakeProfile)
const getSessionUserId = mock.fn<(req: Request) => Promise<string | null>>(
  async () => AUTH_USER_ID,
)

const api = setupTestApp({ getProfileByAuthUserId, getSessionUserId })

beforeEach(() => {
  getProfileByAuthUserId.mock.resetCalls()
  getProfileByAuthUserId.mock.mockImplementation(async () => fakeProfile)
  getSessionUserId.mock.resetCalls()
  getSessionUserId.mock.mockImplementation(async () => AUTH_USER_ID)
})

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
