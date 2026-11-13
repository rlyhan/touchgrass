import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { Activity, PatternTypeId, ScoredRecommendation } from "@touchgrass/types"
import { MOTIVATION_OPTIONS } from "@touchgrass/types/constants"

import { getHighBaseScoreActivities, getHighFinalScoreActivities, getMeanAndSd, scoreRecommendation } from "./score.js"

const creativeMotivation = MOTIVATION_OPTIONS.find((m) => m.value === "explore_creative")!

const makeRec = (
  type: Activity["type"],
  related_types?: Activity["related_types"],
  slug = "test",
): Activity => ({
  slug,
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

test("getMeanAndSd returns the mean and population standard deviation", () => {
  assert.deepEqual(getMeanAndSd([2, 4, 4, 4, 5, 5, 7, 9]), { mean: 5, sd: 2 })
})

const scoredWith = (scores: number[]): ScoredRecommendation[] =>
  scores.map((score, i) => ({ rec: makeRec("Creative", undefined, `rec-${i}`), score }))

test("getHighFinalScoreActivities keeps activities at or above the mean plus half a standard deviation", () => {
  // mean 5, SD 2 → cutoff 6
  const kept = getHighFinalScoreActivities(scoredWith([2, 4, 4, 4, 5, 5, 7, 9]))
  assert.deepEqual(kept.map((rec) => rec.slug), ["rec-6", "rec-7"])
})

test("getHighFinalScoreActivities keeps every activity when all scores are equal, since the cutoff is inclusive", () => {
  assert.equal(getHighFinalScoreActivities(scoredWith([1.5, 1.5, 1.5])).length, 3)
})

test("getHighBaseScoreActivities keeps only activities strictly above the mean base score plus one standard deviation", () => {
  // Creative's patterns all weigh 1 and the others' 0, so base scores are 1, 0, 0 → cutoff ≈ 0.80
  const weights = { "4-HH": 1, "9-HH": 1, "7-LH": 1 } as Record<PatternTypeId, number>
  const activities = [makeRec("Creative", undefined, "creative"), makeRec("Physical", undefined, "physical"), makeRec("Social", undefined, "social")]
  assert.deepEqual(getHighBaseScoreActivities(weights, activities).map((rec) => rec.slug), ["creative"])
})

test("getHighBaseScoreActivities keeps nothing when every base score is equal, since the cutoff is strict", () => {
  const weights = {} as Record<PatternTypeId, number>
  const activities = [makeRec("Creative", undefined, "creative"), makeRec("Physical", undefined, "physical")]
  assert.deepEqual(getHighBaseScoreActivities(weights, activities), [])
})
