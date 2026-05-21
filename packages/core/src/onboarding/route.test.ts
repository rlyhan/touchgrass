import { strict as assert } from "node:assert"
import type { Server } from "node:http"
import type { AddressInfo } from "node:net"
import { after, before, beforeEach, mock, test } from "node:test"

import type { Request } from "express"

import { createApp } from "../app.js"
import type { NewProfile, Profile } from "../db/schema.js"

const AUTH_USER_ID = "auth_user_abc"

const validPayload = {
  name: "Ada Lovelace",
  birthdate: "1990-04-12",
  heightCm: "172",
  gender: "Female" as const,
  build: "Athletic" as const,
  location: "London",
  employment: "Employed" as const,
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
}

const fakeCreatedProfile: Profile = {
  id: "00000000-0000-0000-0000-000000000001",
  authUserId: AUTH_USER_ID,
  name: validPayload.name,
  birthdate: validPayload.birthdate,
  heightCm: 172,
  gender: validPayload.gender,
  build: validPayload.build,
  location: validPayload.location,
  employment: validPayload.employment,
  interests: validPayload.interests,
  personality: validPayload.personality,
  motivations: validPayload.motivations,
  createdAt: new Date("2026-01-01T00:00:00Z"),
}

const insertProfile = mock.fn<(newProfile: NewProfile) => Promise<Profile>>(
  async () => fakeCreatedProfile,
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

beforeEach(() => {
  insertProfile.mock.resetCalls()
  insertProfile.mock.mockImplementation(async () => fakeCreatedProfile)
  getProfileByAuthUserId.mock.resetCalls()
  getProfileByAuthUserId.mock.mockImplementation(async () => null)
  getSessionUserId.mock.resetCalls()
  getSessionUserId.mock.mockImplementation(async () => AUTH_USER_ID)
})

test("POST /profiles returns 201 with the created profile on a valid payload", async () => {
  const res = await fetch(`${baseUrl}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  })

  assert.equal(res.status, 201)
  const body = (await res.json()) as { profile: Profile }
  assert.equal(body.profile.id, fakeCreatedProfile.id)
  assert.equal(body.profile.authUserId, AUTH_USER_ID)
  assert.equal(body.profile.name, validPayload.name)

  assert.equal(insertProfile.mock.callCount(), 1)
  const calledWith = insertProfile.mock.calls[0]?.arguments[0]
  assert.equal(calledWith?.heightCm, 172)
  assert.equal(calledWith?.name, validPayload.name)
  assert.equal(calledWith?.authUserId, AUTH_USER_ID)
})

test("POST /profiles returns 401 when there is no session", async () => {
  getSessionUserId.mock.mockImplementation(async () => null)

  const res = await fetch(`${baseUrl}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  })

  assert.equal(res.status, 401)
  assert.equal(insertProfile.mock.callCount(), 0)
})

test("POST /profiles returns 400 with sanitized validation errors on an invalid payload", async () => {
  const res = await fetch(`${baseUrl}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validPayload, name: "" }),
  })

  assert.equal(res.status, 400)
  const body = (await res.json()) as { errors: { path: unknown[]; message: string }[] }
  assert.ok(Array.isArray(body.errors))
  assert.ok(body.errors.length > 0)
  // Only path and message — no internal Zod fields (code, expected, origin, etc.)
  for (const err of body.errors) {
    assert.deepEqual(Object.keys(err).sort(), ["message", "path"])
  }
  assert.equal(insertProfile.mock.callCount(), 0)
})

test("POST /profiles returns 409 when a profile already exists", async () => {
  getProfileByAuthUserId.mock.mockImplementation(async () => fakeCreatedProfile)

  const res = await fetch(`${baseUrl}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  })

  assert.equal(res.status, 409)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Profile already exists")
  assert.equal(insertProfile.mock.callCount(), 0)
})

test("POST /profiles returns 409 on DB unique constraint violation (race condition)", async () => {
  const constraintError = Object.assign(new Error("unique violation"), { code: "23505" })
  insertProfile.mock.mockImplementation(async () => { throw constraintError })

  const res = await fetch(`${baseUrl}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  })

  assert.equal(res.status, 409)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Profile already exists")
})

test("POST /profiles returns 500 when the database insert fails", async () => {
  insertProfile.mock.mockImplementation(async () => {
    throw new Error("db down")
  })

  const res = await fetch(`${baseUrl}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  })

  assert.equal(res.status, 500)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Failed to create profile")
})
