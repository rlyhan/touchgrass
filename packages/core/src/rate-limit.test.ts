import { strict as assert } from "node:assert"
import { beforeEach, test } from "node:test"

import { profileLimiter, readLimiter } from "./rate-limit.js"
import { setupTestApp } from "./test-utils/test-app.js"

const api = setupTestApp(
  { getSessionUserId: async () => "auth_user_rate_limit" },
  { disableRateLimits: false },
)

// The limiters are shared module instances keyed by IP, so POST and PATCH /profile
// would otherwise share one budget across tests.
beforeEach(async () => {
  await profileLimiter.resetKey("127.0.0.1")
  await readLimiter.resetKey("127.0.0.1")
})

test("POST /profile is rate-limited after the per-IP threshold", async () => {
  // The profile limiter is 10 / hour. Only the 11th request may 429.
  const statuses: number[] = []
  for (let i = 0; i < 11; i++) {
    const res = await fetch(`${api.baseUrl}/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    statuses.push(res.status)
    // Drain body to avoid leaking sockets
    await res.text()
  }

  assert.ok(!statuses.slice(0, -1).includes(429), `limited too early: ${statuses.join(",")}`)
  assert.equal(statuses.at(-1), 429)
})

test("PATCH /profile is rate-limited after the per-IP threshold", async () => {
  // The profile limiter is 10 / hour. Only the 11th request may 429.
  const statuses: number[] = []
  for (let i = 0; i < 11; i++) {
    const res = await fetch(`${api.baseUrl}/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interests: ["hiking"],
      }),
    })
    statuses.push(res.status)
    // Drain body to avoid leaking sockets
    await res.text()
  }

  assert.ok(!statuses.slice(0, -1).includes(429), `limited too early: ${statuses.join(",")}`)
  assert.equal(statuses.at(-1), 429)
})

test("GET /recommendations is rate-limited after the per-IP threshold", async () => {
  // The read limiter is 120 / minute. Only the 121st request may 429.
  const statuses: number[] = []
  for (let i = 0; i < 121; i++) {
    const res = await fetch(`${api.baseUrl}/recommendations`)
    statuses.push(res.status)
    await res.text()
  }

  assert.ok(!statuses.slice(0, -1).includes(429), `limited too early: ${statuses.join(",")}`)
  assert.equal(statuses.at(-1), 429)
})
