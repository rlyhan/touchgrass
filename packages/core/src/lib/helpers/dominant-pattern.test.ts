import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { Activity, PatternTypeId } from "@touchgrass/types"

import { getDominantPatternId } from "./dominant-pattern.js"

const weights = (overrides: Partial<Record<PatternTypeId, number>>) =>
  overrides as Record<PatternTypeId, number>

const activity = (
  type: Activity["type"],
  related_types?: Activity["related_types"],
): Pick<Activity, "type" | "related_types"> => ({ type, related_types })

test("returns the highest-weighted pattern from the activity's primary type", () => {
  // Creative → ['4-HH', '9-HH', '7-LH']; 9-HH has the highest weight
  const result = getDominantPatternId(
    weights({ "4-HH": 0.4, "9-HH": 0.9, "7-LH": 0.6 }),
    activity("Creative"),
  )
  assert.equal(result, "9-HH")
})

test("considers patterns from related_types when picking the dominant pattern", () => {
  // Creative primary: 4-HH, 9-HH, 7-LH ; Social related: 1-HH, 3-HL, 6-HL
  // Highest is 3-HL from related
  const result = getDominantPatternId(
    weights({ "4-HH": 0.2, "9-HH": 0.3, "7-LH": 0.1, "1-HH": 0.4, "3-HL": 0.95, "6-HL": 0.5 }),
    activity("Creative", ["Social"]),
  )
  assert.equal(result, "3-HL")
})

test("treats missing pattern weights as 0", () => {
  // Only 4-HH has a weight; the rest default to 0 and lose to it
  const result = getDominantPatternId(
    weights({ "4-HH": 0.1 }),
    activity("Creative"),
  )
  assert.equal(result, "4-HH")
})

test("breaks ties by pattern ID string sort for determinism", () => {
  // All tied at 0.5 → '4-HH' < '7-LH' < '9-HH' lexicographically
  const result = getDominantPatternId(
    weights({ "4-HH": 0.5, "9-HH": 0.5, "7-LH": 0.5 }),
    activity("Creative"),
  )
  assert.equal(result, "4-HH")
})

test("deduplicates patterns appearing in both primary and related sets", () => {
  // Reflective primary: 4-LH, 10-HH, 6-HH ; Mindful related: 4-LH, 6-HL, 10-LH
  // 4-LH appears in both — still considered once, picked if highest
  const result = getDominantPatternId(
    weights({ "4-LH": 0.99, "10-HH": 0.1, "6-HH": 0.1, "6-HL": 0.1, "10-LH": 0.1 }),
    activity("Reflective", ["Mindful"]),
  )
  assert.equal(result, "4-LH")
})

test("returns null when the activity has no resolvable patterns", () => {
  // ACTIVITY_TYPE_PATTERNS has entries for every ActivityType, but if we
  // somehow get an empty candidate set (e.g. an activity type with [] patterns
  // and no related_types), we return null. Simulate by mocking nothing —
  // realistically this is defensive against future schema drift.
  const empty = { type: "Creative" as Activity["type"], related_types: [] }
  // Real data still resolves Creative; this confirms null path:
  // we test the empty-candidates branch by giving an unknown type cast.
  const fakeType = { type: "__missing__" as Activity["type"], related_types: undefined }
  assert.equal(getDominantPatternId(weights({}), fakeType), null)
  // And the real Creative type still returns something:
  assert.notEqual(getDominantPatternId(weights({}), empty), null)
})
