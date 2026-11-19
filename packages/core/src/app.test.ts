import { strict as assert } from "node:assert"
import { test } from "node:test"

import { toNodeHandler } from "better-auth/node"

import { auth, corsOrigins } from "./auth/auth.js"
import { setupTestApp } from "./test-utils/test-app.js"

const api = setupTestApp({ authHandler: toNodeHandler(auth), corsOrigins })

test("CORS: trusted origin receives Access-Control-Allow-Origin header", async () => {
  const res = await fetch(`${api.baseUrl}/health`, {
    headers: { Origin: "http://localhost:8081" },
  })

  assert.equal(res.status, 200)
  assert.equal(
    res.headers.get("access-control-allow-origin"),
    "http://localhost:8081",
  )
})

test("CORS: untrusted origin does not receive Access-Control-Allow-Origin header", async () => {
  const res = await fetch(`${api.baseUrl}/health`, {
    headers: { Origin: "https://evil.com" },
  })

  assert.equal(res.status, 200)
  assert.equal(res.headers.get("access-control-allow-origin"), null)
})

test("CORS: preflight from trusted origin is approved", async () => {
  const res = await fetch(`${api.baseUrl}/recommendations`, {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:8081",
      "Access-Control-Request-Method": "GET",
    },
  })

  assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:8081")
})

test("CORS: preflight from untrusted origin is denied", async () => {
  const res = await fetch(`${api.baseUrl}/recommendations`, {
    method: "OPTIONS",
    headers: {
      Origin: "https://evil.com",
      "Access-Control-Request-Method": "GET",
    },
  })

  assert.equal(res.headers.get("access-control-allow-origin"), null)
})

test("unknown routes return a JSON 404", async () => {
  const res = await fetch(`${api.baseUrl}/does-not-exist`)

  assert.equal(res.status, 404)
  assert.ok(res.headers.get("content-type")?.includes("application/json"))
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Not found")
})

test("auth: cookie POST with untrusted Origin is rejected before reaching the DB", async () => {
  const res = await fetch(`${api.baseUrl}/api/auth/sign-in/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://evil.com",
    },
    body: JSON.stringify({
      email: "anyone@example.com",
      password: "irrelevant-since-we-should-never-get-here",
    }),
  })

  // 401 would mean the credential path ran — we want a hard rejection before that.
  assert.ok(
    res.status >= 400 && res.status < 500 && res.status !== 401,
    `expected origin rejection (4xx, not 401), got ${res.status}`,
  )

  assert.equal(
    res.headers.get("set-cookie"),
    null,
    "no Set-Cookie should be emitted on untrusted-origin POST",
  )
})

test("auth: cookie POST with trusted Origin is not blocked at the origin layer", async () => {
  const res = await fetch(`${api.baseUrl}/api/auth/sign-in/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:8081",
    },
    body: JSON.stringify({
      email: "anyone@example.com",
      password: "irrelevant",
    }),
  })

  assert.notEqual(
    res.status,
    403,
    "trusted origin should not be blocked by the origin check",
  )
})
