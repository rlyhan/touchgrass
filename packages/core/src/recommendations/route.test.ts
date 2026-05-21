import { strict as assert } from "node:assert"
import type { Server } from "node:http"
import type { AddressInfo } from "node:net"
import { after, before, beforeEach, mock, test } from "node:test"

import type { Request } from "express"

import type { Activity } from "@touchgrass/types"

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

let server: Server
let baseUrl: string

before(() => {
  const app = createApp({
    insertProfile,
    getProfileByAuthUserId,
    getSessionUserId,
  })
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
  const body = (await res.json()) as { recommendations: Activity[] }
  assert.ok(Array.isArray(body.recommendations))
  assert.ok(body.recommendations.length > 0)
  for (const rec of body.recommendations) {
    assert.ok(typeof rec.slug === "string")
    assert.ok(typeof rec.title === "string")
  }

  assert.equal(getProfileByAuthUserId.mock.callCount(), 1)
  assert.equal(getProfileByAuthUserId.mock.calls[0]?.arguments[0], AUTH_USER_ID)
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

test("GET /recommendations returns 500 when the lookup fails", async () => {
  getProfileByAuthUserId.mock.mockImplementation(async () => {
    throw new Error("db down")
  })

  const res = await fetch(`${baseUrl}/recommendations`)

  assert.equal(res.status, 500)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Failed to get recommendations")
})

test("GET /recommendations returns 500 when personality data is malformed", async () => {
  // Simulates a jsonb row that bypasses the ORM's compile-time .$type<T>() cast
  getProfileByAuthUserId.mock.mockImplementation(async () => ({
    ...fakeProfile,
    personality: { Openness: 999 }, // out-of-range, missing 9 required traits
  } as unknown as Profile))

  const res = await fetch(`${baseUrl}/recommendations`)

  assert.equal(res.status, 500)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Failed to get recommendations")
})
