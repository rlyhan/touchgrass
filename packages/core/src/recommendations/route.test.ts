import { strict as assert } from "node:assert"
import type { Server } from "node:http"
import type { AddressInfo } from "node:net"
import { after, before, beforeEach, mock, test } from "node:test"

import type { Recommendation } from "@touchgrass/types"

import { createApp } from "../app.js"
import type { NewUser, User } from "../db/schema.js"

const fakeUser: User = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Ada Lovelace",
  birthdate: "1990-04-12",
  heightCm: 172,
  gender: "Female",
  build: "Athletic",
  location: "London",
  employment: "Employed",
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
  createdAt: new Date("2026-01-01T00:00:00Z"),
}

const insertUser = mock.fn<(newUser: NewUser) => Promise<User>>(
  async () => fakeUser,
)
const getUserById = mock.fn<(id: string) => Promise<User | null>>(
  async () => fakeUser,
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
  getUserById.mock.resetCalls()
  getUserById.mock.mockImplementation(async () => fakeUser)
})

test("GET /users/:userId/recommendations returns 200 with recommendations for a known user", async () => {
  const res = await fetch(`${baseUrl}/users/${fakeUser.id}/recommendations`)

  assert.equal(res.status, 200)
  const body = (await res.json()) as { recommendations: Recommendation[] }
  assert.ok(Array.isArray(body.recommendations))
  assert.ok(body.recommendations.length > 0)
  for (const rec of body.recommendations) {
    assert.ok(typeof rec.id === "string")
    assert.ok(typeof rec.title === "string")
  }

  assert.equal(getUserById.mock.callCount(), 1)
  assert.equal(getUserById.mock.calls[0]?.arguments[0], fakeUser.id)
})

test("GET /users/:userId/recommendations returns 404 when the user does not exist", async () => {
  getUserById.mock.mockImplementation(async () => null)

  const res = await fetch(
    `${baseUrl}/users/00000000-0000-0000-0000-000000000999/recommendations`,
  )

  assert.equal(res.status, 404)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "User not found")
})

test("GET /users/:userId/recommendations returns 500 when the lookup fails", async () => {
  getUserById.mock.mockImplementation(async () => {
    throw new Error("db down")
  })

  const res = await fetch(`${baseUrl}/users/${fakeUser.id}/recommendations`)

  assert.equal(res.status, 500)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Failed to get recommendations")
})
