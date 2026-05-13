import { strict as assert } from "node:assert"
import { test } from "node:test"

import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { ActivityField, BFASScores } from "@touchgrass/types"
import { ACTIVITY_TYPES } from "@touchgrass/types/constants"

import {
  getRecommendations,
  getTopActivityTypes,
} from "./recommendation-algorithm.js"

const mockUserBfas: BFASScores = {
  Openness: 80,
  Intellect: 90,
  Industriousness: 70,
  Orderliness: 60,
  Enthusiasm: 55,
  Assertiveness: 65,
  Compassion: 75,
  Politeness: 50,
  Volatility: 30,
  Withdrawal: 25,
}

test("getRecommendations returns up to 3 recommendations", () => {
  const scored = getRecommendations(mockUserBfas, [], [])
  assert.ok(scored.length <= 3)
  assert.ok(scored.length > 0)
})

test("getRecommendations only returns items from the available recommendation pool", () => {
  const scored = getRecommendations(mockUserBfas, [], [])
  const ids = new Set(RECOMMENDATIONS.map((r) => r.id))
  for (const { rec } of scored) {
    assert.ok(ids.has(rec.id), `unknown recommendation id: ${rec.id}`)
  }
})

test("getRecommendations with no interests returns recommendations in score-sorted order", () => {
  const scored = getRecommendations(mockUserBfas, [], [])
  for (let i = 1; i < scored.length; i++) {
    const prev = scored[i - 1]
    const curr = scored[i]
    assert.ok(
      prev !== undefined && curr !== undefined && prev.score >= curr.score,
      `expected scores to be non-increasing, got ${prev?.score} then ${curr?.score}`,
    )
  }
})

test("getRecommendations places interest-matching recommendations before non-matching ones", () => {
  const interests: ActivityField[] = ["Music", "Writing"]
  const interestSet = new Set<ActivityField>(interests)
  const scored = getRecommendations(mockUserBfas, [], interests)

  let seenNonMatch = false
  for (const { rec } of scored) {
    const isMatch = interestSet.has(rec.field)
    if (!isMatch) {
      seenNonMatch = true
    } else {
      assert.ok(
        !seenNonMatch,
        `interest-matching rec ${rec.id} (${rec.field}) appeared after a non-matching rec`,
      )
    }
  }
})

test("getRecommendations sorts the interest-matching group by descending score", () => {
  const interests: ActivityField[] = ["Music", "Writing"]
  const interestSet = new Set<ActivityField>(interests)
  const matches = getRecommendations(mockUserBfas, [], interests).filter(
    ({ rec }) => interestSet.has(rec.field),
  )
  for (let i = 1; i < matches.length; i++) {
    const prev = matches[i - 1]
    const curr = matches[i]
    assert.ok(
      prev !== undefined && curr !== undefined && prev.score >= curr.score,
      `expected interest-match scores to be non-increasing, got ${prev?.score} then ${curr?.score}`,
    )
  }
})

test("getRecommendations sorts the non-matching group by descending score", () => {
  const interests: ActivityField[] = ["Music"]
  const interestSet = new Set<ActivityField>(interests)
  const others = getRecommendations(mockUserBfas, [], interests).filter(
    ({ rec }) => !interestSet.has(rec.field),
  )
  for (let i = 1; i < others.length; i++) {
    const prev = others[i - 1]
    const curr = others[i]
    assert.ok(
      prev !== undefined && curr !== undefined && prev.score >= curr.score,
      `expected non-match scores to be non-increasing, got ${prev?.score} then ${curr?.score}`,
    )
  }
})

test("getRecommendations interest boost can surface recs beyond the score-only top N", () => {
  // Without interest boost, the top-N is decided purely by score on the diverse set.
  // Adding an interest must never decrease how many matching recs appear in the result —
  // it should surface matches that would otherwise be cut off by the MAX_RECOMMENDATIONS slice.
  const interests: ActivityField[] = ["Music"]
  const interestSet = new Set<ActivityField>(interests)
  const without = getRecommendations(mockUserBfas, [], [])
  const withBoost = getRecommendations(mockUserBfas, [], interests)

  const matchCountWithout = without.filter(({ rec }) =>
    interestSet.has(rec.field),
  ).length
  const matchCountWith = withBoost.filter(({ rec }) =>
    interestSet.has(rec.field),
  ).length

  assert.ok(
    matchCountWith >= matchCountWithout,
    `expected interest boost not to drop matches, got without=${matchCountWithout} with=${matchCountWith}`,
  )
})

test("getRecommendations with empty interests matches pure score-only ordering", () => {
  const boosted = getRecommendations(mockUserBfas, [], [])
  const sortedByScore = [...boosted].sort((a, b) => b.score - a.score)
  assert.deepEqual(
    boosted.map(({ rec }) => rec.id),
    sortedByScore.map(({ rec }) => rec.id),
  )
})

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
