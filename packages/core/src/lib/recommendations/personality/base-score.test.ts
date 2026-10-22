import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { Activity, BFASScores, PatternTypeId } from "@touchgrass/types"

import { calculateRecommendationBaseScore } from "./base-score.js"
import { getOCEANScores } from "./ocean.js"
import { getUserPatternWeights } from "./patterns.js"

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

const neutralBfas: BFASScores = {
  Openness: 50,
  Intellect: 50,
  Industriousness: 50,
  Orderliness: 50,
  Enthusiasm: 50,
  Assertiveness: 50,
  Compassion: 50,
  Politeness: 50,
  Volatility: 50,
  Withdrawal: 50,
}

// Creative patterns: ['4-HH', '9-HH', '7-LH']
// Social patterns:   ['1-HH', '3-HL', '6-HL']
// Reflective patterns: ['4-LH', '10-HH', '6-HH']

test("calculateRecommendationBaseScore returns primaryAffinity directly when there are no related types", () => {
  // primaryAffinity = (0.6 + 0.9 + 0.3) / 3 = 0.6
  const weights = { "4-HH": 0.6, "9-HH": 0.9, "7-LH": 0.3 } as Record<PatternTypeId, number>
  assert.equal(calculateRecommendationBaseScore(weights, makeRec("Creative")), 0.6)
})

test("calculateRecommendationBaseScore returns 0 when userPatternWeights is empty", () => {
  assert.equal(
    calculateRecommendationBaseScore({} as Record<PatternTypeId, number>, makeRec("Creative")),
    0,
  )
})

test("calculateRecommendationBaseScore returns only primaryAffinity score if no secondary affinities", () => {
  // primaryAffinity = 1.0; secondaryAffinity = 0 (no Social weights)
  // expected = 1.0 + 0*0.2 = 1.0
  const weights = { "4-HH": 1, "9-HH": 1, "7-LH": 1 } as Record<PatternTypeId, number>
  const score = calculateRecommendationBaseScore(weights, makeRec("Creative", ["Social"]))
  assert.ok(Math.abs(score - 1.0) < 1e-9, `expected 1.0, got ${score}`)
})

test("calculateRecommendationBaseScore adds secondary boost (× 0.2) on top of primary when related types are present", () => {
  // primaryAffinity = (0.9+0.9+0.9)/3 = 0.9
  // secondaryAffinity (Social) = (0.3+0.3+0.3)/3 = 0.3
  // expected = 0.9 + 0.3*0.2 = 0.96
  const weights = {
    "4-HH": 0.9, "9-HH": 0.9, "7-LH": 0.9,
    "1-HH": 0.3, "3-HL": 0.3, "6-HL": 0.3,
  } as Record<PatternTypeId, number>
  const score = calculateRecommendationBaseScore(weights, makeRec("Creative", ["Social"]))
  assert.ok(Math.abs(score - 0.96) < 1e-9, `expected 0.96, got ${score}`)
})

test("calculateRecommendationBaseScore returns 1.2 when all pattern weights are 1 (arithmetic ceiling)", () => {
  // "Compose a 1-Minute Song" (rec_006): type Creative, related_types [Artistic, Expressive]
  // Primary   Creative  → 4-HH (E+O), 9-HH (C+O),  7-LH (a+O)
  // Secondary Artistic  → 4-HH,       9-LH (c+O),   10-HH (N+O)
  //           Expressive→ 1-HH (E+A),  4-HH,         10-HH
  // 9-HH/9-LH require C=100 vs C=0; 1-HH/7-LH require A=100 vs A=0 — these
  // weights cannot all reach 1.0 from real OCEAN scores simultaneously.
  // Weights are injected directly to verify the arithmetic ceiling of the formula.
  // primaryAffinity = 1.0; secondaryAffinity = 1.0 → 1.0 + 1.0*0.2 = 1.2
  const weights = {
    "4-HH": 1, "9-HH": 1, "7-LH": 1,
    "9-LH": 1, "10-HH": 1, "1-HH": 1,
  } as Record<PatternTypeId, number>
  assert.equal(calculateRecommendationBaseScore(weights, makeRec("Creative", ["Artistic", "Expressive"])), 1.2)
})

test("calculateRecommendationBaseScore returns 0 when all pattern weights are 0 (minimum possible score)", () => {
  // Same rec as the max-score test; the same opposing-polarity conflicts apply in reverse
  // (e.g. C=0 for 9-HH vs C=100 for 9-LH), so a real user cannot hit every pattern
  // floor simultaneously either. Weights are injected directly to verify the arithmetic floor.
  // primaryAffinity = 0.0; secondaryAffinity = 0.0 → 0.0 + 0.0*0.2 = 0.0
  const weights = {
    "4-HH": 0, "9-HH": 0, "7-LH": 0,
    "9-LH": 0, "10-HH": 0, "1-HH": 0,
  } as Record<PatternTypeId, number>
  assert.equal(calculateRecommendationBaseScore(weights, makeRec("Creative", ["Artistic", "Expressive"])), 0)
})

test("calculateRecommendationBaseScore treats all related-type patterns as a single secondary pool", () => {
  // secondaryPatterns = Social (3) + Reflective (3) = 6 patterns
  // primaryAffinity = 1.0; secondaryAffinity = 0.5
  // expected = 1.0 + 0.5*0.2 = 1.1
  const weights = {
    "4-HH": 1, "9-HH": 1, "7-LH": 1,
    "1-HH": 0.5, "3-HL": 0.5, "6-HL": 0.5,
    "4-LH": 0.5, "10-HH": 0.5, "6-HH": 0.5,
  } as Record<PatternTypeId, number>
  const score = calculateRecommendationBaseScore(weights, makeRec("Creative", ["Social", "Reflective"]))
  assert.ok(Math.abs(score - 1.1) < 1e-9, `expected 1.1, got ${score}`)
})

test("calculateRecommendationBaseScore counts a pattern once per related type it appears in", () => {
  // Creative and Artistic both include 4-HH, so the secondary pool is 6 patterns with 4-HH twice.
  // primaryAffinity (Social) = 0; secondaryAffinity = 2/6, not 1/5 → 0 + (1/3)*0.2
  const weights = { "4-HH": 1 } as Record<PatternTypeId, number>
  const score = calculateRecommendationBaseScore(weights, makeRec("Social", ["Creative", "Artistic"]))
  assert.ok(Math.abs(score - 0.2 / 3) < 1e-9, `expected ${0.2 / 3}, got ${score}`)
})

test("calculateRecommendationBaseScore gives a neutral user 0.5 without related types and 0.6 with them", () => {
  // 50 on every trait → every pattern weight is 0.5, so the related-type bonus alone adds 0.5*0.2
  const weights = getUserPatternWeights(getOCEANScores(neutralBfas))
  assert.equal(calculateRecommendationBaseScore(weights, makeRec("Creative")), 0.5)
  const withRelated = calculateRecommendationBaseScore(weights, makeRec("Creative", ["Social"]))
  assert.ok(Math.abs(withRelated - 0.6) < 1e-9, `expected 0.6, got ${withRelated}`)
})
