import { strict as assert } from "node:assert"
import { test } from "node:test"

import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { Activity, ActivityField, BFASScores, Motivation } from "@touchgrass/types"
import { MOTIVATION_OPTIONS } from "@touchgrass/types/constants"

import { getRecommendations, getSharedActivityTypesBetweenActivityAndUserMotivations } from "./get-recommendations.js"
import { calculateRecommendationBaseScore } from "./personality/base-score.js"
import { getOCEANScores } from "./personality/ocean.js"
import { getUserPatternWeights } from "./personality/patterns.js"
import { scoreRecommendation } from "./score.js"
import { getDominantPatternId } from "@touchgrass/types/dominant-pattern"

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

const creativeAdventureAndPeople = MOTIVATION_OPTIONS.filter((m) =>
  ["explore_creative", "seek_adventure", "connect_with_people"].includes(m.value),
)

function overlappingMotivationLabels(activity: Activity, motivations: Motivation[]): string[] {
  const types = [activity.type, ...(activity.related_types ?? [])]
  return motivations
    .filter((m) => m.associated_activity_types.some((t) => types.includes(t)))
    .map((m) => m.label)
}

function strongPersonalitySlugsFor(bfas: BFASScores): string[] {
  const weights = getUserPatternWeights(getOCEANScores(bfas))
  const baseScores = RECOMMENDATIONS.map((rec) => calculateRecommendationBaseScore(weights, rec))
  const mean = baseScores.reduce((sum, score) => sum + score, 0) / baseScores.length
  const sd = Math.sqrt(baseScores.reduce((sum, score) => sum + (score - mean) ** 2, 0) / baseScores.length)
  return RECOMMENDATIONS.filter((rec, i) => baseScores[i]! > mean + sd && getDominantPatternId(weights, rec) !== null).map(
    (rec) => rec.slug,
  )
}

test("getRecommendations gives a personality label to exactly the activities over one SD above the mean base score with a high-scoring pattern", () => {
  const strongPersonalitySlugs = strongPersonalitySlugsFor(mockUserBfas)

  const { matchLabels } = getRecommendations(mockUserBfas, creativeAdventureAndPeople, [], RECOMMENDATIONS)
  const personalityLabelledSlugs = RECOMMENDATIONS.map((rec) => rec.slug).filter((slug) =>
    ["personality", "strong"].includes(matchLabels[slug]?.kind ?? ""),
  )
  assert.ok(strongPersonalitySlugs.length > 0)
  assert.deepEqual(personalityLabelledSlugs, strongPersonalitySlugs)
})

test("getRecommendations gives a motivation label only to recommended activities overlapping two or more motivations, naming them", () => {
  const { matchLabels, recommendedSlugs } = getRecommendations(mockUserBfas, creativeAdventureAndPeople, [], RECOMMENDATIONS)
  const motivationLabelled = RECOMMENDATIONS.filter((rec) => ["motivation", "strong"].includes(matchLabels[rec.slug]?.kind ?? ""))

  assert.ok(motivationLabelled.length > 0)
  for (const rec of RECOMMENDATIONS) {
    const overlaps = overlappingMotivationLabels(rec, creativeAdventureAndPeople)
    const qualifies = recommendedSlugs.includes(rec.slug) && overlaps.length >= 2
    assert.equal(motivationLabelled.includes(rec), qualifies, rec.slug)
    const label = matchLabels[rec.slug]
    if (label?.kind === "motivation") assert.deepEqual(label.motivations, overlaps)
  }
})

test("getRecommendations labels activities that qualify for both the personality and motivation labels as strong", () => {
  const everyMotivation = [...MOTIVATION_OPTIONS]
  const strongPersonalitySlugs = strongPersonalitySlugsFor(mockUserBfas)

  const { matchLabels, recommendedSlugs } = getRecommendations(mockUserBfas, everyMotivation, [], RECOMMENDATIONS)
  const strongMatchSlugs = RECOMMENDATIONS.map((rec) => rec.slug).filter((slug) => matchLabels[slug]?.kind === "strong")
  const bothSlugs = RECOMMENDATIONS.filter(
    (rec) =>
      strongPersonalitySlugs.includes(rec.slug) &&
      recommendedSlugs.includes(rec.slug) &&
      overlappingMotivationLabels(rec, everyMotivation).length >= 2,
  ).map((rec) => rec.slug)

  assert.ok(bothSlugs.length > 0)
  assert.deepEqual(strongMatchSlugs, bothSlugs)
})

test("getRecommendations labels the rest of recommendedSlugs a good match and leaves other activities unlabelled", () => {
  const { matchLabels, recommendedSlugs } = getRecommendations(mockUserBfas, creativeAdventureAndPeople, [], RECOMMENDATIONS)

  for (const rec of RECOMMENDATIONS) {
    const kind = matchLabels[rec.slug]?.kind
    if (recommendedSlugs.includes(rec.slug)) assert.ok(kind !== undefined, rec.slug)
    else assert.ok(kind === undefined || kind === "personality", rec.slug)
  }
})

test("getRecommendations gives no personality label to a user with middling scores and no high-scoring pattern", () => {
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
  const weights = getUserPatternWeights(getOCEANScores(middlingUser))
  const baseScores = RECOMMENDATIONS.map((rec) => calculateRecommendationBaseScore(weights, rec))
  const mean = baseScores.reduce((sum, score) => sum + score, 0) / baseScores.length
  const sd = Math.sqrt(baseScores.reduce((sum, score) => sum + (score - mean) ** 2, 0) / baseScores.length)

  assert.ok(Object.values(weights).every((weight) => weight < 0.6))
  assert.ok(baseScores.some((score) => score > mean + sd))

  const { matchLabels } = getRecommendations(middlingUser, creativeAdventureAndPeople, [], RECOMMENDATIONS)
  const personalityKinds = Object.values(matchLabels).filter((label) => label.kind === "personality" || label.kind === "strong")
  assert.equal(personalityKinds.length, 0)
})

test("getRecommendations gives no personality label to a user who scores 50 on every aspect", () => {
  const neutralUser = Object.fromEntries(Object.keys(mockUserBfas).map((aspect) => [aspect, 50])) as BFASScores

  const { matchLabels } = getRecommendations(neutralUser, creativeAdventureAndPeople, [], RECOMMENDATIONS)
  const personalityKinds = Object.values(matchLabels).filter((label) => label.kind === "personality" || label.kind === "strong")
  assert.equal(personalityKinds.length, 0)
})

const sharedTypesActivity: Activity = { ...RECOMMENDATIONS[0]!, type: "Outdoorsy", related_types: ["Social", "Reflective"] }
const sharedTypesMotivations: Motivation[] = [
  { value: "connect_with_people", label: "People", associated_activity_types: ["Social", "Collaborative"] },
  { value: "seek_adventure", label: "Adventure", associated_activity_types: ["Adventurous", "Outdoorsy", "Exploratory"] },
  { value: "challenge_push_myself", label: "Challenge", associated_activity_types: ["Competitive", "Physical"] },
  { value: "improve_wellbeing", label: "Wellbeing", associated_activity_types: ["Reflective", "Outdoorsy"] },
]

test("getSharedActivityTypesBetweenActivityAndUserMotivations lists only the types each motivation shares with the activity, leaving out motivations that share none", () => {
  assert.deepEqual(getSharedActivityTypesBetweenActivityAndUserMotivations(sharedTypesActivity, sharedTypesMotivations), {
    connect_with_people: ["Social"],
    seek_adventure: ["Outdoorsy"],
    improve_wellbeing: ["Reflective", "Outdoorsy"],
  })
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
