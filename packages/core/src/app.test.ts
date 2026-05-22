import { strict as assert } from "node:assert"
import type { Server } from "node:http"
import type { AddressInfo } from "node:net"
import { after, before, mock, test } from "node:test"

import type { Request } from "express"

import { createApp } from "./app.js"
import type { NewProfile, Profile } from "./db/schema.js"

const fakeProfile: Profile = {
  id: "00000000-0000-0000-0000-000000000001",
  authUserId: "auth_user_abc",
  name: "Test User",
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
>(async () => fakeProfile)
const getSessionUserId = mock.fn<(req: Request) => Promise<string | null>>(
  async () => "auth_user_abc",
)

let server: Server
let baseUrl: string

before(() => {
  const app = createApp(
    {
      insertProfile,
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

test("CORS: trusted origin receives Access-Control-Allow-Origin header", async () => {
  const res = await fetch(`${baseUrl}/health`, {
    headers: { Origin: "http://localhost:8081" },
  })

  assert.equal(res.status, 200)
  assert.equal(
    res.headers.get("access-control-allow-origin"),
    "http://localhost:8081",
  )
})

test("CORS: untrusted origin does not receive Access-Control-Allow-Origin header", async () => {
  const res = await fetch(`${baseUrl}/health`, {
    headers: { Origin: "https://evil.com" },
  })

  assert.equal(res.status, 200)
  assert.equal(res.headers.get("access-control-allow-origin"), null)
})

test("CORS: preflight from trusted origin is approved", async () => {
  const res = await fetch(`${baseUrl}/recommendations`, {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:8081",
      "Access-Control-Request-Method": "GET",
    },
  })

  assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:8081")
})

test("CORS: preflight from untrusted origin is denied", async () => {
  const res = await fetch(`${baseUrl}/recommendations`, {
    method: "OPTIONS",
    headers: {
      Origin: "https://evil.com",
      "Access-Control-Request-Method": "GET",
    },
  })

  assert.equal(res.headers.get("access-control-allow-origin"), null)
})

test("unknown routes return a JSON 404", async () => {
  const res = await fetch(`${baseUrl}/does-not-exist`)

  assert.equal(res.status, 404)
  assert.ok(res.headers.get("content-type")?.includes("application/json"))
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Not found")
})
