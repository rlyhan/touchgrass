import { strict as assert } from "node:assert"
import type { Server } from "node:http"
import type { AddressInfo } from "node:net"
import { after, before, beforeEach, mock, test } from "node:test"

import type { Request } from "express"

import type { Activity } from "@touchgrass/types"

import { createApp } from "../app.js"
import type { NewProfile, Profile } from "../db/schema.js"

const AUTH_USER_ID = "auth_user_abc"

const activity: Activity = {
  slug: "stargaze-from-a-rooftop",
  title: "Stargaze From a Rooftop",
  imageUrl: "https://example.com/stargaze.jpg",
  type: "Reflective",
  field: "Nature",
  estimated_time: "1 hour",
}

const insertProfile = mock.fn<(newProfile: NewProfile) => Promise<Profile>>()
const getProfileByAuthUserId = mock.fn<
  (authUserId: string) => Promise<Profile | null>
>()
const getSessionUserId = mock.fn<(req: Request) => Promise<string | null>>(
  async () => AUTH_USER_ID,
)
const getActivityBySlug = mock.fn<(slug: string) => Promise<Activity | null>>(
  async (slug) => (slug === activity.slug ? activity : null),
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
      getActivityBySlug,
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
  getSessionUserId.mock.resetCalls()
  getSessionUserId.mock.mockImplementation(async () => AUTH_USER_ID)
  getActivityBySlug.mock.resetCalls()
  getActivityBySlug.mock.mockImplementation(async (slug) =>
    slug === activity.slug ? activity : null,
  )
})

test("GET /activities/:slug returns 200 with the activity when found", async () => {
  const res = await fetch(`${baseUrl}/activities/${activity.slug}`)

  assert.equal(res.status, 200)
  const body = (await res.json()) as { activity: Activity }
  assert.equal(body.activity.slug, activity.slug)
  assert.equal(body.activity.title, activity.title)
  assert.equal(getActivityBySlug.mock.callCount(), 1)
  assert.equal(getActivityBySlug.mock.calls[0]?.arguments[0], activity.slug)
})

test("GET /activities/:slug returns 404 when the activity is unknown", async () => {
  const res = await fetch(`${baseUrl}/activities/unknown-activity`)

  assert.equal(res.status, 404)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Activity not found")
})

test("GET /activities/:slug returns 401 when there is no session", async () => {
  getSessionUserId.mock.mockImplementation(async () => null)

  const res = await fetch(`${baseUrl}/activities/${activity.slug}`)

  assert.equal(res.status, 401)
  assert.equal(getActivityBySlug.mock.callCount(), 0)
})

test("GET /activities/:slug returns 400 when the slug contains invalid characters", async () => {
  const res = await fetch(`${baseUrl}/activities/${encodeURIComponent("Bad Slug!")}`)

  assert.equal(res.status, 400)
  const body = (await res.json()) as { errors: { path: unknown[]; message: string }[] }
  assert.ok(Array.isArray(body.errors))
  assert.ok(body.errors.length > 0)
  assert.equal(getActivityBySlug.mock.callCount(), 0)
})

test("GET /activities/:slug returns 500 when getSessionUserId throws", async () => {
  getSessionUserId.mock.mockImplementation(async () => {
    throw new Error("session lookup failed")
  })

  const res = await fetch(`${baseUrl}/activities/${activity.slug}`)

  assert.equal(res.status, 500)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Failed to get activity")
  assert.equal(getActivityBySlug.mock.callCount(), 0)
})

test("GET /activities/:slug returns 500 when the lookup fails", async () => {
  getActivityBySlug.mock.mockImplementation(async () => {
    throw new Error("source down")
  })

  const res = await fetch(`${baseUrl}/activities/${activity.slug}`)

  assert.equal(res.status, 500)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Failed to get activity")
})
