import { strict as assert } from "node:assert"
import { test } from "node:test"

import { isStrongPersonality } from "./strong-personality.js"

test("isStrongPersonality is true when the activity is a top personality fit and has a dominant pattern", () => {
  assert.equal(isStrongPersonality(true, "4-HH"), true)
})

test("isStrongPersonality is false for a top personality fit with no dominant pattern", () => {
  assert.equal(isStrongPersonality(true, null), false)
})

test("isStrongPersonality is false for a dominant pattern on an activity that is not a top personality fit", () => {
  assert.equal(isStrongPersonality(false, "4-HH"), false)
})

test("isStrongPersonality is false when neither check passes", () => {
  assert.equal(isStrongPersonality(false, null), false)
})
