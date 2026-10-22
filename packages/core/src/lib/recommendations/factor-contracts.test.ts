import { strict as assert } from "node:assert"
import { test } from "node:test"

import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { BFASScores } from "@touchgrass/types"
import { ACTIVITY_FIELDS, MOTIVATION_OPTIONS } from "@touchgrass/types/constants"

import { getRecommendations } from "./get-recommendations.js"
import { calculateMotivationBoost } from "./motivation/boost.js"
import { calculateRecommendationBaseScore } from "./personality/base-score.js"
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
