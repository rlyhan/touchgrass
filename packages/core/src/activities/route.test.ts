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

const searchable: Activity[] = [
  activity,
  { ...activity, slug: "hike-a-coastal-trail", title: "Hike a Coastal Trail", type: "Active" },
  { ...activity, slug: "learn-guitar-chords", title: "Learn Guitar Chords", field: "Music" },
]
const loadRecommendations = mock.fn<() => Promise<Activity[]>>(async () => searchable)

let server: Server
let baseUrl: string

before(() => {
  const app = createApp(
    {
      insertProfile,
      getProfileByAuthUserId,
      getSessionUserId,
      loadRecommendations,
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
  loadRecommendations.mock.resetCalls()
})

type SearchBody = { items: Activity[]; total: number }

test("GET /activities/search matches title, field and type case-insensitively", async () => {
  const res = await fetch(`${baseUrl}/activities/search?q=${encodeURIComponent("  MUSIC ")}`)

  assert.equal(res.status, 200)
  const body = (await res.json()) as SearchBody
  assert.deepEqual(body.items.map((a) => a.slug), ["learn-guitar-chords"])
  assert.equal(body.total, 1)
})

test("GET /activities/search pages results with offset and limit", async () => {
  const res = await fetch(`${baseUrl}/activities/search?q=a&offset=1&limit=1`)

  assert.equal(res.status, 200)
  const body = (await res.json()) as SearchBody
  assert.deepEqual(body.items.map((a) => a.slug), ["hike-a-coastal-trail"])
  assert.equal(body.total, 3)
})

test("GET /activities/search returns every activity when the query is empty", async () => {
  const res = await fetch(`${baseUrl}/activities/search?q=%20%20`)

  assert.equal(res.status, 200)
  const body = (await res.json()) as SearchBody
  assert.equal(body.total, searchable.length)
})

test("GET /activities/search filters by any of the selected types", async () => {
  const res = await fetch(`${baseUrl}/activities/search?type=Active,Analytical`)

  assert.equal(res.status, 200)
  const body = (await res.json()) as SearchBody
  assert.deepEqual(body.items.map((a) => a.slug), ["hike-a-coastal-trail"])
})

test("GET /activities/search requires a match on both type and field", async () => {
  const res = await fetch(`${baseUrl}/activities/search?type=Reflective&field=Music`)

  assert.equal(res.status, 200)
  const body = (await res.json()) as SearchBody
  assert.deepEqual(body.items.map((a) => a.slug), ["learn-guitar-chords"])
})

test("GET /activities/search combines filters with the text query", async () => {
  const res = await fetch(`${baseUrl}/activities/search?q=stargaze&field=Music`)

  assert.equal(res.status, 200)
  const body = (await res.json()) as SearchBody
  assert.equal(body.total, 0)
})

test("GET /activities/search returns 400 for an unknown filter value", async () => {
  const res = await fetch(`${baseUrl}/activities/search?field=Juggling`)

  assert.equal(res.status, 400)
  assert.equal(loadRecommendations.mock.callCount(), 0)
})

test("GET /activities/search returns 400 when limit is out of range", async () => {
  const res = await fetch(`${baseUrl}/activities/search?q=a&limit=500`)

  assert.equal(res.status, 400)
  assert.equal(loadRecommendations.mock.callCount(), 0)
})

test("GET /activities/search works without a session", async () => {
  getSessionUserId.mock.mockImplementation(async () => null)

  const res = await fetch(`${baseUrl}/activities/search?q=a`)

  assert.equal(res.status, 200)
  assert.equal(getSessionUserId.mock.callCount(), 0)
})

test("GET /activities/search is not routed to the slug lookup", async () => {
  await fetch(`${baseUrl}/activities/search?q=a`)

  assert.equal(getActivityBySlug.mock.callCount(), 0)
})

type RandomBody = { activities: Activity[] }

test("GET /activities/random returns the requested number of distinct activities", async () => {
  const res = await fetch(`${baseUrl}/activities/random?count=2`)

  assert.equal(res.status, 200)
  const { activities } = (await res.json()) as RandomBody
  const slugs = activities.map((a) => a.slug)
  assert.equal(slugs.length, 2)
  assert.equal(new Set(slugs).size, 2)
  assert.ok(slugs.every((slug) => searchable.some((a) => a.slug === slug)))
})

test("GET /activities/random returns every activity when count exceeds the pool", async () => {
  const res = await fetch(`${baseUrl}/activities/random?count=50`)

  assert.equal(res.status, 200)
  const { activities } = (await res.json()) as RandomBody
  assert.deepEqual(
    activities.map((a) => a.slug).sort(),
    searchable.map((a) => a.slug).sort(),
  )
})

test("GET /activities/random returns 400 when count is out of range", async () => {
  const res = await fetch(`${baseUrl}/activities/random?count=0`)

  assert.equal(res.status, 400)
  assert.equal(loadRecommendations.mock.callCount(), 0)
})

test("GET /activities/random works without a session and is not routed to the slug lookup", async () => {
  getSessionUserId.mock.mockImplementation(async () => null)

  const res = await fetch(`${baseUrl}/activities/random`)

  assert.equal(res.status, 200)
  assert.equal(getSessionUserId.mock.callCount(), 0)
  assert.equal(getActivityBySlug.mock.callCount(), 0)
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
  assert.equal(body.error, "Internal server error")
  assert.equal(getActivityBySlug.mock.callCount(), 0)
})

test("GET /activities/:slug returns 500 when the lookup fails", async () => {
  getActivityBySlug.mock.mockImplementation(async () => {
    throw new Error("source down")
  })

  const res = await fetch(`${baseUrl}/activities/${activity.slug}`)

  assert.equal(res.status, 500)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Internal server error")
})
