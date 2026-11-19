import { strict as assert } from "node:assert"
import { test } from "node:test"

import { setupTestApp } from "./test-utils/test-app.js"

const api = setupTestApp(
  { getSessionUserId: async () => "auth_user_rate_limit" },
  { disableRateLimits: false },
)

test("POST /profile is rate-limited after the per-IP threshold", async () => {
  // The profile limiter is 10 / hour. Fire 11 requests; the last one must 429.
  let lastStatus = 0
  for (let i = 0; i < 11; i++) {
    const res = await fetch(`${api.baseUrl}/profile`, {
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

test("PATCH /profile is rate-limited after the per-IP threshold", async () => {
  // The profile limiter is 10 / hour. Fire 11 requests; the last one must 429.
  let lastStatus = 0
  for (let i = 0; i < 11; i++) {
    const res = await fetch(`${api.baseUrl}/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interests: ["hiking"],
      }),
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
    const res = await fetch(`${api.baseUrl}/recommendations`)
    lastStatus = res.status
    await res.text()
  }

  assert.equal(lastStatus, 429)
})
