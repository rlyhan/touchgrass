import { strict as assert } from "node:assert"
import { test } from "node:test"

import {
  parseExtraTrustedOrigins,
  resolveTrustedOrigins,
} from "./trusted-origins.js"

test("parseExtraTrustedOrigins splits, trims, and drops blanks", () => {
  assert.deepEqual(
    parseExtraTrustedOrigins(" https://a.example , https://b.example ,, "),
    ["https://a.example", "https://b.example"],
  )
})

test("parseExtraTrustedOrigins returns [] when env var is undefined", () => {
  assert.deepEqual(parseExtraTrustedOrigins(undefined), [])
})

test("resolveTrustedOrigins includes dev origins outside production", () => {
  const origins = resolveTrustedOrigins({
    extraTrustedOrigins: [],
    isProd: false,
  })

  assert.ok(origins.includes("touchgrass://"))
  assert.ok(origins.includes("http://localhost:8081"))
})

test("resolveTrustedOrigins throws in production when no https origin is configured", () => {
  assert.throws(
    () =>
      resolveTrustedOrigins({
        extraTrustedOrigins: [],
        isProd: true,
      }),
    /at least one https:\/\/ origin in production/,
  )
})

test("resolveTrustedOrigins throws in production when only the app scheme is configured", () => {
  assert.throws(
    () =>
      resolveTrustedOrigins({
        extraTrustedOrigins: ["touchgrass://"],
        isProd: true,
      }),
    /at least one https:\/\/ origin in production/,
  )
})

test("resolveTrustedOrigins accepts a single https origin in production", () => {
  const origins = resolveTrustedOrigins({
    extraTrustedOrigins: ["https://app.touchgrass.com"],
    isProd: true,
  })

  assert.deepEqual(origins, ["touchgrass://", "https://app.touchgrass.com"])
  // Localhost dev origins are NOT included in production.
  assert.ok(!origins.includes("http://localhost:8081"))
})
