import { strict as assert } from "node:assert"
import { test } from "node:test"

import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { ActivityField, BFASScores } from "@touchgrass/types"
import { MOTIVATION_OPTIONS } from "@touchgrass/types/constants"

import { getRecommendations } from "./get-recommendations.js"
import { getOCEANScores } from "./personality/ocean.js"
import { getUserPatternWeights } from "./personality/patterns.js"
import { scoreRecommendation } from "./score.js"

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
