import { strict as assert } from "node:assert"
import { test } from "node:test"

import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { BFASScores } from "@touchgrass/types"

import { getRecommendations } from "./recommendation-algorithm.js"

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
  const scored = getRecommendations(mockUserBfas)
  assert.ok(scored.length <= 3)
  assert.ok(scored.length > 0)
})

test("getRecommendations only returns items from the available recommendation pool", () => {
  const scored = getRecommendations(mockUserBfas)
  const ids = new Set(RECOMMENDATIONS.map((r) => r.id))
  for (const { rec } of scored) {
    assert.ok(ids.has(rec.id), `unknown recommendation id: ${rec.id}`)
  }
})

test("getRecommendations returns recommendations in score-sorted order", () => {
  const scored = getRecommendations(mockUserBfas)
  for (let i = 1; i < scored.length; i++) {
    const prev = scored[i - 1]
    const curr = scored[i]
    assert.ok(
      prev !== undefined && curr !== undefined && prev.score >= curr.score,
      `expected scores to be non-increasing, got ${prev?.score} then ${curr?.score}`,
    )
  }
})
