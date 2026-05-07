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
    Openness: 80,
    Intellect: 90,
    Industriousness: 70,
    Orderliness: 60,
    Enthusiasm: 55,
    Assertiveness: 65,
    Compassion: 75,
    Politeness: 50,
    Volatility: 30,
    Withdrawal: 25,
  },
  motivations: ["Curiosity", "Mastery"],
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
>(async () => fakeCreatedProfile)
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
  insertProfile.mock.resetCalls()
  insertProfile.mock.mockImplementation(async () => fakeCreatedProfile)
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

test("POST /profiles returns 400 with validation errors on an invalid payload", async () => {
  const res = await fetch(`${baseUrl}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validPayload, name: "" }),
  })

  assert.equal(res.status, 400)
  const body = (await res.json()) as { errors: unknown[] }
  assert.ok(Array.isArray(body.errors))
  assert.ok(body.errors.length > 0)
  assert.equal(insertProfile.mock.callCount(), 0)
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
