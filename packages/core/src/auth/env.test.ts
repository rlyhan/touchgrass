import { strict as assert } from "node:assert"
import { test } from "node:test"

import { readAuthEnv } from "./env.js"

const validEnv = {
  BETTER_AUTH_SECRET: "secret",
  BETTER_AUTH_URL: "http://localhost:3000",
}

test("readAuthEnv throws when BETTER_AUTH_SECRET is missing", () => {
  assert.throws(
    () => readAuthEnv({ ...validEnv, BETTER_AUTH_SECRET: undefined }),
    /BETTER_AUTH_SECRET is not set/,
  )
})

test("readAuthEnv throws when BETTER_AUTH_URL is missing", () => {
  assert.throws(
    () => readAuthEnv({ ...validEnv, BETTER_AUTH_URL: undefined }),
    /BETTER_AUTH_URL is not set/,
  )
})

test("readAuthEnv returns secret, base URL and origins", () => {
  const result = readAuthEnv({
    ...validEnv,
    BETTER_AUTH_TRUSTED_ORIGINS: "https://app.example",
  })
  assert.equal(result.secret, "secret")
  assert.equal(result.baseUrl, "http://localhost:3000")
  assert.ok(result.trustedOrigins.includes("https://app.example"))
  assert.ok(result.trustedOrigins.includes("touchgrass://"))
})

test("readAuthEnv keeps only http(s) origins for CORS", () => {
  const result = readAuthEnv({
    ...validEnv,
    BETTER_AUTH_TRUSTED_ORIGINS: "https://app.example",
  })
  assert.ok(result.corsOrigins.includes("https://app.example"))
  assert.ok(result.corsOrigins.every((o) => o.startsWith("http")))
})

test("readAuthEnv requires an https origin in production", () => {
  assert.throws(
    () => readAuthEnv({ ...validEnv, NODE_ENV: "production" }),
    /at least one https:\/\/ origin/,
  )
})
