import { strict as assert } from "node:assert"
import type { Server } from "node:http"
import type { AddressInfo } from "node:net"
import { after, before, mock, test } from "node:test"

import type { Request } from "express"

import { createApp } from "./app.js"
import type { NewProfile, Profile } from "./db/schema.js"

const AUTH_USER_ID = "auth_user_rate_limit"

const fakeProfile: Profile = {
  id: "00000000-0000-0000-0000-000000000099",
  authUserId: AUTH_USER_ID,
  name: "Rate Limit Tester",
  birthdate: "1990-01-01",
  heightCm: 170,
  gender: null,
  build: null,
  location: "Somewhere",
  employment: null,
  interests: [],
  personality: {
    Openness: 50,
    Intellect: 50,
    Industriousness: 50,
    Orderliness: 50,
    Enthusiasm: 50,
    Assertiveness: 50,
    Compassion: 50,
    Politeness: 50,
    Volatility: 50,
    Withdrawal: 50,
  },
  motivations: [],
  createdAt: new Date("2026-01-01T00:00:00Z"),
}

const insertProfile = mock.fn<(newProfile: NewProfile) => Promise<Profile>>(
  async () => fakeProfile,
)
const getProfileByAuthUserId = mock.fn<
  (authUserId: string) => Promise<Profile | null>
>(async () => null)
const getSessionUserId = mock.fn<(req: Request) => Promise<string | null>>(
  async () => AUTH_USER_ID,
)

let server: Server
let baseUrl: string

before(() => {
  // Default options: rate limits enabled
  const app = createApp({
    insertProfile,
    getProfileByAuthUserId,
    getSessionUserId,
    loadRecommendations: async () => [],
    getActivityBySlug: async () => null,
  })
  server = app.listen(0)
  const { port } = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${port}`
})

after(() => {
  server.close()
})

test("POST /profiles is rate-limited after the per-IP threshold", async () => {
  // The profile limiter is 10 / hour. Fire 11 requests; the last one must 429.
  // Each successful call would mutate insertProfile's mock state, so reset
  // getProfileByAuthUserId to always return null and accept whatever happens.
  let lastStatus = 0
  for (let i = 0; i < 11; i++) {
    const res = await fetch(`${baseUrl}/profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    lastStatus = res.status
    // Drain body to avoid leaking sockets
    await res.text()
  }

  assert.equal(lastStatus, 429)
})

test("GET /recommendations is rate-limited after the per-IP threshold", async () => {
  // The read limiter is 120 / minute. Fire 121 requests; the last one must 429.
  let lastStatus = 0
  for (let i = 0; i < 121; i++) {
    const res = await fetch(`${baseUrl}/recommendations`)
    lastStatus = res.status
    await res.text()
  }

  assert.equal(lastStatus, 429)
})
