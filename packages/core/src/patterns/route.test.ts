import { strict as assert } from "node:assert"
import type { Server } from "node:http"
import type { AddressInfo } from "node:net"
import { after, before, beforeEach, mock, test } from "node:test"

import type { Request } from "express"

import type { PatternWeightsResponse } from "@touchgrass/types"
import { PATTERN_TYPES } from "@touchgrass/types/constants"

import { createApp } from "../app.js"
import type { Profile } from "../db/schema.js"

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
  interests: [],
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
  motivations: [],
  createdAt: new Date("2026-01-01T00:00:00Z"),
}

const getProfileByAuthUserId = mock.fn<
  (authUserId: string) => Promise<Profile | null>
>(async () => fakeProfile)
const getSessionUserId = mock.fn<(req: Request) => Promise<string | null>>(
  async () => AUTH_USER_ID,
)

let server: Server
let baseUrl: string

before(() => {
  const app = createApp(
    {
      insertProfile: async () => fakeProfile,
      getProfileByAuthUserId,
      getSessionUserId,
      loadRecommendations: async () => [],
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

test("GET /pattern-weights returns all 40 pattern weights in [0, 1]", async () => {
  const res = await fetch(`${baseUrl}/pattern-weights`)

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

  const res = await fetch(`${baseUrl}/pattern-weights`)

  assert.equal(res.status, 401)
  assert.equal(getProfileByAuthUserId.mock.callCount(), 0)
})

test("GET /pattern-weights returns 404 when the user has no profile yet", async () => {
  getProfileByAuthUserId.mock.mockImplementation(async () => null)

  const res = await fetch(`${baseUrl}/pattern-weights`)

  assert.equal(res.status, 404)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Profile not found")
})

test("GET /pattern-weights returns 500 when the lookup throws", async () => {
  getProfileByAuthUserId.mock.mockImplementation(async () => {
    throw new Error("db down")
  })

  const res = await fetch(`${baseUrl}/pattern-weights`)

  assert.equal(res.status, 500)
})
