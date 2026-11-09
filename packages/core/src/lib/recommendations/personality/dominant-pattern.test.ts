import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { Activity, PatternTypeId } from "@touchgrass/types"

import { MIN_DOMINANT_WEIGHT, getDominantPatternId } from "@touchgrass/types/dominant-pattern"

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
  // Only 4-HH has a (passing) weight; the rest default to 0 and lose to it
  const result = getDominantPatternId(
    weights({ "4-HH": 0.8 }),
    activity("Creative"),
  )
  assert.equal(result, "4-HH")
})

test("breaks ties by pattern ID string sort for determinism", () => {
  // All tied at 0.7 (above the 0.6 threshold) →
  // '4-HH' < '7-LH' < '9-HH' lexicographically
  const result = getDominantPatternId(
    weights({ "4-HH": 0.7, "9-HH": 0.7, "7-LH": 0.7 }),
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

test("returns null when no candidate pattern meets the default 0.6 threshold", () => {
  // All weights below 0.6 → no pattern qualifies as a "strong" match
  const result = getDominantPatternId(
    weights({ "4-HH": 0.5, "9-HH": 0.4, "7-LH": 0.59 }),
    activity("Creative"),
  )
  assert.equal(result, null)
})

test("returns the top pattern exactly at the 0.6 threshold (inclusive)", () => {
  // Boundary: weight === MIN_DOMINANT_WEIGHT must qualify
  const result = getDominantPatternId(
    weights({ "4-HH": MIN_DOMINANT_WEIGHT, "9-HH": 0.1, "7-LH": 0.1 }),
    activity("Creative"),
  )
  assert.equal(result, "4-HH")
})

test("respects a custom minWeight when provided", () => {
  // With minWeight=0.9, only 0.95 qualifies; without it 0.5 would too
  const w = weights({ "4-HH": 0.5, "9-HH": 0.95, "7-LH": 0.5 })
  assert.equal(getDominantPatternId(w, activity("Creative"), 0.9), "9-HH")
  // Lowering the threshold to 0 returns the absolute max
  assert.equal(getDominantPatternId(w, activity("Creative"), 0), "9-HH")
})

test("returns null when the activity has no resolvable patterns", () => {
  const fakeType = { type: "__missing__" as Activity["type"], related_types: undefined }
  assert.equal(getDominantPatternId(weights({}), fakeType), null)
})
