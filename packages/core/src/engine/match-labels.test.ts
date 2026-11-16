import { strict as assert } from "node:assert"
import { test } from "node:test"

import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import { MOCK_USER_BFAS } from "@touchgrass/mocks/user"
import type { Activity, ActivityType, BFASScores, Motivation, SharedActivityTypesByMotivation } from "@touchgrass/types"
import { MOTIVATION_OPTIONS } from "@touchgrass/types/constants"

import { getRecommendations } from "./get-recommendations.js"
import { getUserPatternWeightsFromBfas } from "./personality/patterns.js"
import { getHighBaseScoreActivities } from "./personality/high-base-score.js"
import { getDominantPatternId } from "./personality/dominant-pattern.js"

const creativeAdventureAndPeople = MOTIVATION_OPTIONS.filter((m) =>
  ["explore_creative", "seek_adventure", "connect_with_people"].includes(m.value),
)

function overlappingMotivationLabels(activity: Activity, motivations: Motivation[]): string[] {
  const types = [activity.type, ...(activity.related_types ?? [])]
  return motivations
    .filter((m) => m.associated_activity_types.some((t) => types.includes(t)))
    .map((m) => m.label)
}

function motivationLabelsOf(sharedActivityTypesByMotivation: SharedActivityTypesByMotivation): string[] {
  return MOTIVATION_OPTIONS.filter((m) => sharedActivityTypesByMotivation[m.value]).map((m) => m.label)
}

function strongPersonalitySlugsFor(bfas: BFASScores): string[] {
  const weights = getUserPatternWeightsFromBfas(bfas)
  return getHighBaseScoreActivities(weights, RECOMMENDATIONS)
    .filter((rec) => getDominantPatternId(weights, rec) !== null)
    .map((rec) => rec.slug)
}

test("getRecommendations labels the recommendations screen's activities recommended", () => {
  const { recommendations, matchLabels } = getRecommendations(MOCK_USER_BFAS, creativeAdventureAndPeople, [], RECOMMENDATIONS)

  assert.ok(recommendations.length > 0)
  for (const { rec } of recommendations) assert.equal(matchLabels[rec.slug]?.kind, "recommended", rec.slug)
})

test("getRecommendations marks the recommendations screen's activity-type picks as picked for variety, one per type", () => {
  const { matchLabels } = getRecommendations(MOCK_USER_BFAS, creativeAdventureAndPeople, ["Art", "Music"], RECOMMENDATIONS)
  const varietyPicks = RECOMMENDATIONS.filter((rec) => matchLabels[rec.slug]?.pickedForVariety)

  assert.ok(varietyPicks.length > 0)
  assert.ok(varietyPicks.every((rec) => matchLabels[rec.slug]?.kind === "recommended"))
  assert.equal(new Set(varietyPicks.map((rec) => rec.type)).size, varietyPicks.length)
})

test("getRecommendations labels every other strong personality match personality and leaves the rest unlabelled", () => {
  const strongPersonalitySlugs = strongPersonalitySlugsFor(MOCK_USER_BFAS)
  const { recommendations, matchLabels } = getRecommendations(MOCK_USER_BFAS, creativeAdventureAndPeople, [], RECOMMENDATIONS)
  const recommendedSlugSet = new Set(recommendations.map(({ rec }) => rec.slug))

  assert.ok(Object.values(matchLabels).some((label) => label.kind === "personality"))
  for (const rec of RECOMMENDATIONS) {
    if (recommendedSlugSet.has(rec.slug)) continue
    const expected = strongPersonalitySlugs.includes(rec.slug) ? "personality" : undefined
    assert.equal(matchLabels[rec.slug]?.kind, expected, rec.slug)
  }
})

test("getRecommendations gives a labelled activity a pattern only when it's over one SD above the mean base score with a high-scoring pattern", () => {
  const strongPersonalitySlugs = strongPersonalitySlugsFor(MOCK_USER_BFAS)

  const { matchLabels } = getRecommendations(MOCK_USER_BFAS, [...MOTIVATION_OPTIONS], [], RECOMMENDATIONS)
  const withPatternSlugs = Object.entries(matchLabels).filter(([, label]) => label.patternId).map(([slug]) => slug)
  const expected = Object.keys(matchLabels).filter((slug) => strongPersonalitySlugs.includes(slug))

  assert.ok(withPatternSlugs.length > 0)
  assert.deepEqual(withPatternSlugs.sort(), expected.sort())
})

test("getRecommendations names the user's best pattern as each label's personality reason", () => {
  const weights = getUserPatternWeightsFromBfas(MOCK_USER_BFAS)
  const { matchLabels } = getRecommendations(MOCK_USER_BFAS, [...MOTIVATION_OPTIONS], [], RECOMMENDATIONS)

  for (const rec of RECOMMENDATIONS) {
    const patternId = matchLabels[rec.slug]?.patternId
    if (patternId) assert.equal(patternId, getDominantPatternId(weights, rec), rec.slug)
  }
})

test("getRecommendations lists each overlapping motivation by value with only the activity types it shares", () => {
  const { matchLabels } = getRecommendations(MOCK_USER_BFAS, [...MOTIVATION_OPTIONS], [], RECOMMENDATIONS)

  for (const rec of RECOMMENDATIONS) {
    const label = matchLabels[rec.slug]
    if (!label) continue
    const activityTypes = [rec.type, ...(rec.related_types ?? [])]
    assert.deepEqual(motivationLabelsOf(label.sharedActivityTypesByMotivation), overlappingMotivationLabels(rec, MOTIVATION_OPTIONS), rec.slug)
    for (const motivation of MOTIVATION_OPTIONS) {
      const sharedActivityTypes: ActivityType[] | undefined = label.sharedActivityTypesByMotivation[motivation.value]
      if (sharedActivityTypes) {
        assert.deepEqual(sharedActivityTypes, motivation.associated_activity_types.filter((t) => activityTypes.includes(t)), rec.slug)
      }
    }
  }
})

test("getRecommendations gives no personality reason to a user with middling scores and no high-scoring pattern", () => {
  const middlingUser: BFASScores = {
    Openness: 62,
    Intellect: 58,
    Industriousness: 45,
    Orderliness: 42,
    Enthusiasm: 44,
    Assertiveness: 40,
    Compassion: 56,
    Politeness: 54,
    Volatility: 52,
    Withdrawal: 48,
  }
  const weights = getUserPatternWeightsFromBfas(middlingUser)

  assert.ok(Object.values(weights).every((weight) => weight < 0.6))
  assert.ok(getHighBaseScoreActivities(weights, RECOMMENDATIONS).length > 0)

  const { matchLabels } = getRecommendations(middlingUser, creativeAdventureAndPeople, [], RECOMMENDATIONS)
  assert.ok(Object.values(matchLabels).length > 0)
  assert.ok(Object.values(matchLabels).every((label) => label.patternId === undefined))
})

test("getRecommendations gives no personality reason to a user who scores 50 on every aspect", () => {
  const neutralUser = Object.fromEntries(Object.keys(MOCK_USER_BFAS).map((aspect) => [aspect, 50])) as BFASScores

  const { matchLabels } = getRecommendations(neutralUser, creativeAdventureAndPeople, [], RECOMMENDATIONS)
  assert.ok(Object.values(matchLabels).every((label) => label.patternId === undefined))
})
