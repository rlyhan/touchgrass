import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { Motivation, Recommendation } from "@touchgrass/types"
import { MOTIVATION_OPTIONS } from "@touchgrass/types/constants"

import {
  calculateMotivationBoost,
  getMotivationRelevantTraits,
} from "./motivation.js"

// Minimal Recommendation factory — only the fields the functions under test care about
const makeRec = (
  type: Recommendation["type"],
  related_types?: Recommendation["related_types"],
): Recommendation => ({
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

test("calculateMotivationBoost returns 0 for empty target traits", () => {
  assert.equal(calculateMotivationBoost({ "1-HH": 0.8 }, []), 0)
})

test("calculateMotivationBoost returns 0 when user has no matching traits", () => {
  // User has no strength for "1-HH" or any of its group-1 neighbours
  assert.equal(calculateMotivationBoost({}, ["1-HH"]), 0)
})

test("calculateMotivationBoost applies EXACT weight for a matching pattern id", () => {
  // exactBoost = 0.8 * 1.0 = 0.8; normalised by default factor 5 → 0.16
  const boost = calculateMotivationBoost({ "1-HH": 0.8 }, ["1-HH"])
  assert.ok(Math.abs(boost - 0.16) < 1e-9, `expected 0.16, got ${boost}`)
})

test("calculateMotivationBoost applies STRONG_ADJACENT weight for a distance-1 neighbour", () => {
  // "1-HH" is distance-1 adjacent to "1-HL" (weight 0.65)
  // adjacentBoost = 0.6 * 0.65 = 0.39; normalised → 0.078
  const boost = calculateMotivationBoost({ "1-HH": 0.6 }, ["1-HL"])
  assert.ok(Math.abs(boost - 0.078) < 1e-9, `expected 0.078, got ${boost}`)
})

test("calculateMotivationBoost respects a custom normalization factor", () => {
  // exactBoost = 1.0 * 1.0 = 1.0; normalised by factor 10 → 0.1
  const boost = calculateMotivationBoost({ "1-HH": 1.0 }, ["1-HH"], 10)
  assert.ok(Math.abs(boost - 0.1) < 1e-9, `expected 0.1, got ${boost}`)
})

// ─── getMotivationRelevantTraits ─────────────────────────────────────────────

test("getMotivationRelevantTraits returns empty when no motivations are provided", () => {
  const result = getMotivationRelevantTraits({
    activity: makeRec("Creative"),
    motivations: [],
  })
  assert.deepEqual(result, [])
})

test("getMotivationRelevantTraits returns empty when primary type is not in any motivation", () => {
  const result = getMotivationRelevantTraits({
    activity: makeRec("Reflective"),
    motivations: [creativeMotivation],
  })
  assert.deepEqual(result, [])
})

test("getMotivationRelevantTraits returns patterns when primary type matches a motivation (e.g. Creative → composing music)", () => {
  const result = getMotivationRelevantTraits({
    activity: makeRec("Creative"),
    motivations: [creativeMotivation],
  })
  assert.ok(result.length > 0, "expected at least one pattern id")
})

test("getMotivationRelevantTraits includes patterns from a matching related type", () => {
  // Primary type "Reflective" doesn't match, but related "Artistic" does
  const result = getMotivationRelevantTraits({
    activity: makeRec("Reflective", ["Artistic"]),
    motivations: [creativeMotivation],
  })
  assert.ok(result.length > 0, "expected patterns from the matching related type")
})

test("getMotivationRelevantTraits deduplicates pattern ids across matching types", () => {
  // Both "Creative" and "Artistic" are in creativeMotivation and may share pattern ids
  const result = getMotivationRelevantTraits({
    activity: makeRec("Creative", ["Artistic"]),
    motivations: [creativeMotivation],
  })
  const unique = [...new Set(result)]
  assert.deepEqual(result, unique, "pattern ids should be deduplicated")
})
