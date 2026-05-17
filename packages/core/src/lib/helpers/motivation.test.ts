import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { Activity, Motivation, PatternTypeId } from "@touchgrass/types"
import { MOTIVATION_OPTIONS } from "@touchgrass/types/constants"

import {
  calculateMotivationBoost,
  getMotivationAndActivitySharedPatterns,
} from "./motivation.js"

// Minimal Activity factory — only the fields the functions under test care about
const makeRec = (
  type: Activity["type"],
  related_types?: Activity["related_types"],
): Activity => ({
  id: "test",
  title: "Test",
  imageUrl: "",
  field: "Art",
  estimated_time: "1h",
  type,
  related_types,
})

const creativeMotivation: Motivation = MOTIVATION_OPTIONS.find((m) => m.value === "explore_creative")!

// ─── calculateMotivationBoost ────────────────────────────────────────────────
// Creative activity type maps to patterns ['4-HH', '9-HH', '7-LH'] via ACTIVITY_TYPE_PATTERNS.

test("calculateMotivationBoost returns 0 when no motivations are provided", () => {
  assert.equal(calculateMotivationBoost({} as Record<PatternTypeId, number>, makeRec("Creative"), []), 0)
})

test("calculateMotivationBoost returns 0 when user has no matching patterns", () => {
  assert.equal(calculateMotivationBoost({} as Record<PatternTypeId, number>, makeRec("Creative"), [creativeMotivation]), 0)
})

test("calculateMotivationBoost applies EXACT weight for a matching pattern id", () => {
  // Creative patterns include '4-HH'; exactBoost = 0.8 * 1.0 = 0.8; normalised by factor 5 → 0.16
  const boost = calculateMotivationBoost({ "4-HH": 0.8 } as Record<PatternTypeId, number>, makeRec("Creative"), [creativeMotivation])
  assert.ok(Math.abs(boost - 0.16) < 1e-9, `expected 0.16, got ${boost}`)
})

test("calculateMotivationBoost applies STRONG_ADJACENT weight for a distance-1 neighbour", () => {
  // '4-HH' is distance-1 adjacent to '4-HL' (weight 0.65)
  // adjacentBoost = 0.6 * 0.65 = 0.39; normalised → 0.078
  const boost = calculateMotivationBoost({ "4-HL": 0.6 } as Record<PatternTypeId, number>, makeRec("Creative"), [creativeMotivation])
  assert.ok(Math.abs(boost - 0.078) < 1e-9, `expected 0.078, got ${boost}`)
})

test("calculateMotivationBoost sums exact + adjacent contributions for the same target", () => {
  // target 4-HH: exact = 0.7 * 1.0 = 0.7; adjacent 4-HL = 0.5 * 0.65 = 0.325
  // total = 1.025 / 5 = 0.205
  const boost = calculateMotivationBoost(
    { "4-HH": 0.7, "4-HL": 0.5 } as Record<PatternTypeId, number>,
    makeRec("Creative"),
    [creativeMotivation],
  )
  assert.ok(Math.abs(boost - 0.205) < 1e-9, `expected 0.205, got ${boost}`)
})

test("calculateMotivationBoost respects a custom normalization factor", () => {
  // exactBoost = 1.0 * 1.0 = 1.0; normalised by factor 10 → 0.1
  const boost = calculateMotivationBoost({ "4-HH": 1.0 } as Record<PatternTypeId, number>, makeRec("Creative"), [creativeMotivation], 10)
  assert.ok(Math.abs(boost - 0.1) < 1e-9, `expected 0.1, got ${boost}`)
})

// ─── getMotivationAndActivitySharedPatterns ─────────────────────────────────────────────

test("getMotivationAndActivitySharedPatterns returns empty when no motivations are provided", () => {
  const result = getMotivationAndActivitySharedPatterns({
    activity: makeRec("Creative"),
    motivations: [],
  })
  assert.deepEqual(result, [])
})

test("getMotivationAndActivitySharedPatterns returns empty when primary type is not in any motivation", () => {
  const result = getMotivationAndActivitySharedPatterns({
    activity: makeRec("Reflective"),
    motivations: [creativeMotivation],
  })
  assert.deepEqual(result, [])
})

test("getMotivationAndActivitySharedPatterns returns patterns when primary type matches a motivation (e.g. Creative → composing music)", () => {
  const result = getMotivationAndActivitySharedPatterns({
    activity: makeRec("Creative"),
    motivations: [creativeMotivation],
  })
  assert.ok(result.length > 0, "expected at least one pattern id")
})

test("getMotivationAndActivitySharedPatterns includes patterns from a matching related type", () => {
  // Primary type "Reflective" doesn't match, but related "Artistic" does
  const result = getMotivationAndActivitySharedPatterns({
    activity: makeRec("Reflective", ["Artistic"]),
    motivations: [creativeMotivation],
  })
  assert.ok(result.length > 0, "expected patterns from the matching related type")
})

test("getMotivationAndActivitySharedPatterns deduplicates pattern ids across matching types", () => {
  // Both "Creative" and "Artistic" are in creativeMotivation and may share pattern ids
  const result = getMotivationAndActivitySharedPatterns({
    activity: makeRec("Creative", ["Artistic"]),
    motivations: [creativeMotivation],
  })
  const unique = [...new Set(result)]
  assert.deepEqual(result, unique, "pattern ids should be deduplicated")
})
