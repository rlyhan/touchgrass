import { strict as assert } from "node:assert"
import { test } from "node:test"

import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import { MOCK_USER_BFAS } from "@touchgrass/mocks/user"
import { ACTIVITY_FIELDS, MOTIVATION_OPTIONS } from "@touchgrass/types/constants"

import { getRecommendations } from "./get-recommendations.js"
import { calculateMotivationBoost } from "./motivation/boost.js"
import { calculateRecommendationBaseScore } from "./personality/base-score.js"
import { getUserPatternWeightsFromBfas } from "./personality/patterns.js"

const creativeMotivation = MOTIVATION_OPTIONS.find((m) => m.value === "explore_creative")!

test("getRecommendations gives the same personality reasons whatever the user's interests", () => {
  const withoutInterests = getRecommendations(MOCK_USER_BFAS, [creativeMotivation], [], RECOMMENDATIONS)
  const withEveryInterest = getRecommendations(MOCK_USER_BFAS, [creativeMotivation], [...ACTIVITY_FIELDS], RECOMMENDATIONS)
  const patternsBySlug = (matchLabels: typeof withoutInterests.matchLabels) =>
    Object.fromEntries(Object.entries(matchLabels).flatMap(([slug, label]) => (label.patternId ? [[slug, label.patternId]] : [])))

  assert.ok(Object.keys(patternsBySlug(withoutInterests.matchLabels)).length > 0)
  assert.deepEqual(patternsBySlug(withEveryInterest.matchLabels), patternsBySlug(withoutInterests.matchLabels))
})

test("getRecommendations gives the best personality fit with no motivation boost a personality match, off the recommendations screen", () => {
  const weights = getUserPatternWeightsFromBfas(MOCK_USER_BFAS)
  const [strongestUnboostedFit] = RECOMMENDATIONS.filter(
    (rec) => calculateMotivationBoost(weights, rec, [creativeMotivation]) === 0,
  ).sort((a, b) => calculateRecommendationBaseScore(weights, b) - calculateRecommendationBaseScore(weights, a))

  const { recommendations, matchLabels } = getRecommendations(MOCK_USER_BFAS, [creativeMotivation], [], RECOMMENDATIONS)
  assert.ok(strongestUnboostedFit)
  assert.ok(recommendations.every(({ rec }) => rec.slug !== strongestUnboostedFit.slug))
  assert.equal(matchLabels[strongestUnboostedFit.slug]?.kind, "personality")
})
