import { strict as assert } from "node:assert"
import { test } from "node:test"

import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { Activity, ActivityField, BFASScores, PatternTypeId } from "@touchgrass/types"
import { ACTIVITY_FIELDS, MOTIVATION_OPTIONS } from "@touchgrass/types/constants"

import { getRecommendations, scoreRecommendation } from "./recommendation-algorithm.js"
import { calculateMotivationBoost } from "./helpers/index.js"
import { calculateRecommendationBaseScore } from "./recommendations/personality/base-score.js"
import { getOCEANScores } from "./recommendations/personality/ocean.js"
import { getUserPatternWeights } from "./recommendations/personality/patterns.js"

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
  const scored = getRecommendations(mockUserBfas, [], [], RECOMMENDATIONS).recommendations
  assert.ok(scored.length <= 10)
  assert.ok(scored.length > 0)
})

test("getRecommendations puts activities scoring at least half a standard deviation above the mean in recommendedSlugs", () => {
  const weights = getUserPatternWeights(getOCEANScores(mockUserBfas))
  const scored = RECOMMENDATIONS.map((rec) => scoreRecommendation(weights, rec, [creativeMotivation]))
  const cutoff = recommendedCutoff(scored.map((s) => s.score))
  const aboveCutoffSlugs = scored.filter((s) => s.score >= cutoff).map((s) => s.rec.slug)

  const { recommendedSlugs } = getRecommendations(mockUserBfas, [creativeMotivation], ["Art"], RECOMMENDATIONS)
  assert.deepEqual(recommendedSlugs, aboveCutoffSlugs)
  assert.ok(recommendedSlugs.length > 0 && recommendedSlugs.length < RECOMMENDATIONS.length)
})

function recommendedCutoff(scores: number[]): number {
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const sd = Math.sqrt(scores.reduce((sum, score) => sum + (score - mean) ** 2, 0) / scores.length)
  return mean + sd * 0.5
}

test("getRecommendations doesn't put activities in recommendedSlugs just because many motivations inflate every score", () => {
  const weights = getUserPatternWeights(getOCEANScores(mockUserBfas))
  const allMotivations = [...MOTIVATION_OPTIONS]
  const oneMotivationCutoff = recommendedCutoff(
    RECOMMENDATIONS.map((rec) => scoreRecommendation(weights, rec, [creativeMotivation]).score),
  )
  const allMotivationScores = RECOMMENDATIONS.map((rec) => scoreRecommendation(weights, rec, allMotivations).score)

  assert.ok(RECOMMENDATIONS.every((rec) => calculateMotivationBoost(weights, rec, allMotivations) > 0))
  assert.ok(allMotivationScores.every((score) => score >= oneMotivationCutoff))

  const { recommendedSlugs } = getRecommendations(mockUserBfas, allMotivations, [], RECOMMENDATIONS)
  assert.ok(recommendedSlugs.length < RECOMMENDATIONS.length / 2)
})

test("getRecommendations returns the same recommendedSlugs whatever the user's interests", () => {
  const withoutInterests = getRecommendations(mockUserBfas, [creativeMotivation], [], RECOMMENDATIONS)
  const withEveryInterest = getRecommendations(mockUserBfas, [creativeMotivation], [...ACTIVITY_FIELDS], RECOMMENDATIONS)

  assert.deepEqual(withEveryInterest.recommendedSlugs, withoutInterests.recommendedSlugs)
})

test("getRecommendations leaves the best personality fit out of recommendedSlugs when it gets no motivation boost", () => {
  const weights = getUserPatternWeights(getOCEANScores(mockUserBfas))
  const [strongestUnboostedFit] = RECOMMENDATIONS.filter(
    (rec) => calculateMotivationBoost(weights, rec, [creativeMotivation]) === 0,
  ).sort((a, b) => calculateRecommendationBaseScore(weights, b) - calculateRecommendationBaseScore(weights, a))

  const { recommendedSlugs } = getRecommendations(mockUserBfas, [creativeMotivation], [], RECOMMENDATIONS)
  assert.ok(strongestUnboostedFit)
  assert.equal(recommendedSlugs.includes(strongestUnboostedFit.slug), false)
})

test("getRecommendations only returns items from the available recommendation pool", () => {
  const scored = getRecommendations(mockUserBfas, [], [], RECOMMENDATIONS).recommendations
  const slugs = new Set(RECOMMENDATIONS.map((r) => r.slug))
  for (const { rec } of scored) {
    assert.ok(slugs.has(rec.slug), `unknown recommendation slug: ${rec.slug}`)
  }
})

test("getRecommendations interest boost can surface recs beyond the score-only top N", () => {
  // Adding an interest should never reduce the number of interest-matching recs in the output.
  const interests: ActivityField[] = ["Music"]
  const interestSet = new Set<ActivityField>(interests)
  const without = getRecommendations(mockUserBfas, [], [], RECOMMENDATIONS).recommendations
  const withBoost = getRecommendations(mockUserBfas, [], interests, RECOMMENDATIONS).recommendations

  const matchCountWithout = without.filter(({ rec }) => interestSet.has(rec.field)).length
  const matchCountWith = withBoost.filter(({ rec }) => interestSet.has(rec.field)).length

  assert.ok(
    matchCountWith >= matchCountWithout,
    `expected interest boost not to drop matches, got without=${matchCountWithout} with=${matchCountWith}`,
  )
})

test("getRecommendations output has no duplicate activity types", () => {
  const results = getRecommendations(mockUserBfas, [], [], RECOMMENDATIONS).recommendations
  const types = results.map(({ rec }) => rec.type)
  assert.equal(new Set(types).size, types.length, `duplicate types: [${types.join(", ")}]`)
})

test("getRecommendations with Art interest includes at least one Art-field rec", () => {
  const results = getRecommendations(mockUserBfas, [], ["Art"], RECOMMENDATIONS).recommendations
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
  const results = getRecommendations(artisticCreativeUser, [creativeMotivation], [], RECOMMENDATIONS).recommendations
  const creativeTypes = new Set(creativeMotivation.associated_activity_types)
  const matchCount = results.filter(({ rec }) => creativeTypes.has(rec.type)).length
  assert.ok(matchCount >= 2, `expected >= 2 creative-type recs, got ${matchCount}`)
})

test("getRecommendations: Art interest + explore_creative motivation surfaces Art-field creative-type recs", () => {
  // Art interest promotes Art-field recs; motivation boosts Creative/Artistic types.
  // Together they should surface at least one rec that satisfies both (e.g. rec_061, rec_064).
  const results = getRecommendations(mockUserBfas, [creativeMotivation], ["Art"], RECOMMENDATIONS).recommendations
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
