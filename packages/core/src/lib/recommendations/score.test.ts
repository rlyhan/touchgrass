import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { Activity, PatternTypeId } from "@touchgrass/types"
import { MOTIVATION_OPTIONS } from "@touchgrass/types/constants"

import { scoreRecommendation } from "./score.js"

const creativeMotivation = MOTIVATION_OPTIONS.find((m) => m.value === "explore_creative")!

const makeRec = (
  type: Activity["type"],
  related_types?: Activity["related_types"],
): Activity => ({
  slug: "test",
  title: "Test",
  imageUrl: "",
  field: "Art",
  estimated_time: "1h",
  type,
  related_types,
})

// Creative patterns: ['4-HH', '9-HH', '7-LH']

test("scoreRecommendation returns the recommendation object unchanged", () => {
  const weights = {} as Record<PatternTypeId, number>
  const rec = makeRec("Creative")
  const { rec: returnedRec } = scoreRecommendation(weights, rec, [])
  assert.equal(returnedRec, rec)
})

test("scoreRecommendation returns baseScore as the score when no motivations are given", () => {
  const weights = { "4-HH": 0.6, "9-HH": 0.9, "7-LH": 0.3 } as Record<PatternTypeId, number>
  const rec = makeRec("Creative")
  const { score } = scoreRecommendation(weights, rec, [])
  // baseScore = (0.6+0.9+0.3)/3 = 0.6; motivationBoost = 0
  assert.ok(Math.abs(score - 0.6) < 1e-9, `expected 0.6, got ${score}`)
})

test("scoreRecommendation adds motivation boost to base score", () => {
  // Creative patterns ['4-HH','9-HH','7-LH'] all weight 1.0 → baseScore = 1.0
  // sharedPatterns with creativeMotivation = ['4-HH','9-HH','7-LH']
  // exactBoost = 1+1+1 = 3.0; adjacentBoost = 0; motivationBoost = 3.0/5 = 0.6
  // expected score = 1.0 + 0.6 = 1.6
  const weights = { "4-HH": 1, "9-HH": 1, "7-LH": 1 } as Record<PatternTypeId, number>
  const { score } = scoreRecommendation(weights, makeRec("Creative"), [creativeMotivation])
  assert.ok(Math.abs(score - 1.6) < 1e-9, `expected 1.6, got ${score}`)
})

test("scoreRecommendation score is higher with a matching motivation than without", () => {
  const weights = { "4-HH": 0.8, "9-HH": 0.8, "7-LH": 0.8 } as Record<PatternTypeId, number>
  const rec = makeRec("Creative")
  const withoutBoost = scoreRecommendation(weights, rec, [])
  const withBoost = scoreRecommendation(weights, rec, [creativeMotivation])
  assert.ok(withBoost.score > withoutBoost.score, `expected boost to raise score`)
})
