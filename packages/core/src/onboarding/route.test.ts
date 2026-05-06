import { strict as assert } from "node:assert"
import type { Server } from "node:http"
import type { AddressInfo } from "node:net"
import { after, before, beforeEach, mock, test } from "node:test"

import { createApp } from "../app.js"
import type { NewUser, User } from "../db/schema.js"

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

const fakeCreatedUser: User = {
  id: "00000000-0000-0000-0000-000000000001",
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

const insertUser = mock.fn<(newUser: NewUser) => Promise<User>>(
  async () => fakeCreatedUser,
)
const getUserById = mock.fn<(id: string) => Promise<User | null>>(
  async () => fakeCreatedUser,
)

let server: Server
let baseUrl: string

before(() => {
  const app = createApp({ insertUser, getUserById })
  server = app.listen(0)
  const { port } = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${port}`
})

after(() => {
  server.close()
})

beforeEach(() => {
  insertUser.mock.resetCalls()
  insertUser.mock.mockImplementation(async () => fakeCreatedUser)
})

test("POST /users returns 201 with the created user on a valid payload", async () => {
  const res = await fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  })

  assert.equal(res.status, 201)
  const body = (await res.json()) as { user: User }
  assert.equal(body.user.id, fakeCreatedUser.id)
  assert.equal(body.user.name, validPayload.name)

  assert.equal(insertUser.mock.callCount(), 1)
  const calledWith = insertUser.mock.calls[0]?.arguments[0]
  assert.equal(calledWith?.heightCm, 172)
  assert.equal(calledWith?.name, validPayload.name)
})

test("POST /users returns 400 with validation errors on an invalid payload", async () => {
  const res = await fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validPayload, name: "" }),
  })

  assert.equal(res.status, 400)
  const body = (await res.json()) as { errors: unknown[] }
  assert.ok(Array.isArray(body.errors))
  assert.ok(body.errors.length > 0)
  assert.equal(insertUser.mock.callCount(), 0)
})

test("POST /users returns 500 when the database insert fails", async () => {
  insertUser.mock.mockImplementation(async () => {
    throw new Error("db down")
  })

  const res = await fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  })

  assert.equal(res.status, 500)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Failed to create user")
})
