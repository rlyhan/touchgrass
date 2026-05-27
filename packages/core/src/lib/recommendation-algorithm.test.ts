import { strict as assert } from "node:assert"
import { test } from "node:test"

import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { Activity, ActivityField, BFASScores, PatternTypeId } from "@touchgrass/types"
import { ACTIVITY_TYPES, MOTIVATION_OPTIONS } from "@touchgrass/types/constants"

import {
  calculateRecommendationBaseScore,
  getRecommendations,
  getTopActivityTypes,
  scoreRecommendation,
} from "./recommendation-algorithm.js"

const mockUserBfas: BFASScores = {
  Openness: 97,
  Intellect: 61,
  Industriousness: 63,
  Orderliness: 60,
  Enthusiasm: 16,
  Assertiveness: 19,
  Compassion: 91,
  Politeness: 83,
  Volatility: 68,
  Withdrawal: 63,
}

const creativeMotivation = MOTIVATION_OPTIONS.find((m) => m.value === "explore_creative")!

test("getRecommendations returns up to 10 recommendations", () => {
  const scored = getRecommendations(mockUserBfas, [], [], RECOMMENDATIONS)
  assert.ok(scored.length <= 10)
  assert.ok(scored.length > 0)
})

test("getRecommendations only returns items from the available recommendation pool", () => {
  const scored = getRecommendations(mockUserBfas, [], [], RECOMMENDATIONS)
  const slugs = new Set(RECOMMENDATIONS.map((r) => r.slug))
  for (const { rec } of scored) {
    assert.ok(slugs.has(rec.slug), `unknown recommendation slug: ${rec.slug}`)
  }
})

test("getRecommendations interest boost can surface recs beyond the score-only top N", () => {
  // Adding an interest should never reduce the number of interest-matching recs in the output.
  const interests: ActivityField[] = ["Music"]
  const interestSet = new Set<ActivityField>(interests)
  const without = getRecommendations(mockUserBfas, [], [], RECOMMENDATIONS)
  const withBoost = getRecommendations(mockUserBfas, [], interests, RECOMMENDATIONS)

  const matchCountWithout = without.filter(({ rec }) => interestSet.has(rec.field)).length
  const matchCountWith = withBoost.filter(({ rec }) => interestSet.has(rec.field)).length

  assert.ok(
    matchCountWith >= matchCountWithout,
    `expected interest boost not to drop matches, got without=${matchCountWithout} with=${matchCountWith}`,
  )
})

test("getRecommendations output has no duplicate activity types", () => {
  const results = getRecommendations(mockUserBfas, [], [], RECOMMENDATIONS)
  const types = results.map(({ rec }) => rec.type)
  assert.equal(new Set(types).size, types.length, `duplicate types: [${types.join(", ")}]`)
})

test("getRecommendations with Art interest includes at least one Art-field rec", () => {
  const results = getRecommendations(mockUserBfas, [], ["Art"], RECOMMENDATIONS)
  const artCount = results.filter(({ rec }) => rec.field === "Art").length
  assert.ok(artCount >= 1, `expected >= 1 Art-field rec, got ${artCount}`)
})

test("getRecommendations: high-Openness/Extraversion user with explore_creative motivation and no interests surfaces creative-type recs", () => {
  // High E (4-HH) + high C (9-HH) + high O → strong Creative/Artistic affinity;
  // motivation boost on top should dominate the top slots.
  const artisticCreativeUser: BFASScores = {
    Openness: 100,
    Intellect: 80,
    Industriousness: 80,
    Orderliness: 80,
    Enthusiasm: 90,
    Assertiveness: 70,
    Compassion: 50,
    Politeness: 50,
    Volatility: 30,
    Withdrawal: 20,
  }
  const results = getRecommendations(artisticCreativeUser, [creativeMotivation], [], RECOMMENDATIONS)
  const creativeTypes = new Set(creativeMotivation.associated_activity_types)
  const matchCount = results.filter(({ rec }) => creativeTypes.has(rec.type)).length
  assert.ok(matchCount >= 2, `expected >= 2 creative-type recs, got ${matchCount}`)
})

test("getRecommendations: Art interest + explore_creative motivation surfaces Art-field creative-type recs", () => {
  // Art interest promotes Art-field recs; motivation boosts Creative/Artistic types.
  // Together they should surface at least one rec that satisfies both (e.g. rec_061, rec_064).
  const results = getRecommendations(mockUserBfas, [creativeMotivation], ["Art"], RECOMMENDATIONS)
  const creativeTypes = new Set(creativeMotivation.associated_activity_types)
  const artCreativeCount = results.filter(
    ({ rec }) => rec.field === "Art" && creativeTypes.has(rec.type),
  ).length
  assert.ok(artCreativeCount >= 1, `expected >= 1 Art-field creative-type rec, got ${artCreativeCount}`)
})

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
// Social patterns:   ['1-HH', '3-HL', '6-HL']
// Reflective patterns: ['4-LH', '10-HH', '6-HH']

// ─── calculateRecommendationBaseScore ────────────────────────────────────────

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

// ─── scoreRecommendation ─────────────────────────────────────────────────────

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

// ─── getTopActivityTypes ─────────────────────────────────────────────────────

test("getTopActivityTypes returns 6 activity types by default", () => {
  const top = getTopActivityTypes(mockUserBfas)
  assert.equal(top.length, 6)
})

test("getTopActivityTypes honours a custom count", () => {
  const top = getTopActivityTypes(mockUserBfas, 3)
  assert.equal(top.length, 3)
})

test("getTopActivityTypes returns results sorted by descending score", () => {
  const top = getTopActivityTypes(mockUserBfas)
  for (let i = 1; i < top.length; i++) {
    const prev = top[i - 1]
    const curr = top[i]
    assert.ok(
      prev !== undefined && curr !== undefined && prev.score >= curr.score,
      `expected scores to be non-increasing, got ${prev?.score} then ${curr?.score}`,
    )
  }
})

test("getTopActivityTypes returns distinct activity types from the known pool", () => {
  const top = getTopActivityTypes(mockUserBfas)
  const knownTypes = new Set<string>(ACTIVITY_TYPES)
  const seen = new Set<string>()
  for (const { type } of top) {
    assert.ok(knownTypes.has(type), `unknown activity type: ${type}`)
    assert.ok(!seen.has(type), `duplicate activity type: ${type}`)
    seen.add(type)
  }
})

test("getTopActivityTypes ranks types whose patterns match the user higher than mismatched ones", () => {
  // Low Extraversion + High Openness → Reflective (4-LH, 10-HH, 6-HH) should
  // clearly outrank Active (2-HH, 3-HL, 1-HL), which all rely on high Extraversion.
  const introvertedOpenUser: BFASScores = {
    Openness: 100,
    Intellect: 100,
    Industriousness: 50,
    Orderliness: 50,
    Enthusiasm: 0,
    Assertiveness: 0,
    Compassion: 50,
    Politeness: 50,
    Volatility: 50,
    Withdrawal: 50,
  }
  const top = getTopActivityTypes(introvertedOpenUser, ACTIVITY_TYPES.length)
  const reflectiveIndex = top.findIndex((t) => t.type === "Reflective")
  const activeIndex = top.findIndex((t) => t.type === "Active")
  assert.ok(reflectiveIndex !== -1 && activeIndex !== -1)
  assert.ok(
    reflectiveIndex < activeIndex,
    `expected Reflective (#${reflectiveIndex}) to rank above Active (#${activeIndex})`,
  )
})
