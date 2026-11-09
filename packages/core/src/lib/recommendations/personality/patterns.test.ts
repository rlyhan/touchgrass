import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { OCEANScores, PatternType, PatternTypeId } from "@touchgrass/types"

import { calculateActivityPatternAffinity, calculatePatternStrength } from "./patterns.js"

const userOcean: OCEANScores = {
  Openness: 80,
  Conscientiousness: 50,
  Extraversion: 70,
  Agreeableness: 30,
  Neuroticism: 10,
}

const patternHH: PatternType = {
  id: "1-HH",
  groupId: 1,
  name: "test",
  shortDescription: "",
  traitA: { trait: "Extraversion", level: "H" },
  traitB: { trait: "Agreeableness", level: "H" },
}

const patternLL: PatternType = {
  ...patternHH,
  id: "1-LL",
  traitA: { trait: "Extraversion", level: "L" },
  traitB: { trait: "Agreeableness", level: "L" },
}

const patternHL: PatternType = {
  ...patternHH,
  id: "1-HL",
  traitA: { trait: "Extraversion", level: "H" },
  traitB: { trait: "Agreeableness", level: "L" },
}

test("calculatePatternStrength scores H-level traits as score/100 and averages both traits", () => {
  // Extraversion=70 → 0.7 ; Agreeableness=30 → 0.3 ; avg = 0.5
  assert.equal(calculatePatternStrength(userOcean, patternHH), 0.5)
})

test("calculatePatternStrength scores L-level traits as (1 - score/100) and averages both traits", () => {
  // Extraversion=70 → 0.3 ; Agreeableness=30 → 0.7 ; avg = 0.5
  assert.equal(calculatePatternStrength(userOcean, patternLL), 0.5)
})

test("calculatePatternStrength gives high strength when user matches the H/L mix", () => {
  // Extraversion=70 (H) → 0.7 ; Agreeableness=30 (L) → 0.7 ; avg = 0.7
  assert.equal(calculatePatternStrength(userOcean, patternHL), 0.7)
})

test("calculatePatternStrength returns the extremes for 0 and 100 trait scores", () => {
  const extreme: OCEANScores = {
    Openness: 0,
    Conscientiousness: 0,
    Extraversion: 100,
    Agreeableness: 100,
    Neuroticism: 0,
  }
  // Both at 100 with HH pattern → perfect match
  assert.equal(calculatePatternStrength(extreme, patternHH), 1)
  // Both at 100 with LL pattern → worst match
  assert.equal(calculatePatternStrength(extreme, patternLL), 0)
})

test("calculateActivityPatternAffinity returns 0 for an empty pattern list", () => {
  assert.equal(calculateActivityPatternAffinity({ "1-HH": 0.9 } as Record<PatternTypeId, number>, []), 0)
})

test("calculateActivityPatternAffinity averages the user's strengths across the requested patterns", () => {
  const strengths = { "1-HH": 0.8, "1-LL": 0.2, "2-HH": 0.5 } as Record<
    PatternType["id"],
    number
  >
  assert.equal(
    calculateActivityPatternAffinity(strengths, ["1-HH", "1-LL", "2-HH"]),
    0.5,
  )
})

test("calculateActivityPatternAffinity treats missing pattern ids as 0", () => {
  const strengths = { "1-HH": 1 } as Record<PatternType["id"], number>
  // 1 + 0 + 0 = 1; / 3 = 0.333...
  const affinity = calculateActivityPatternAffinity(strengths, [
    "1-HH",
    "1-LL",
    "2-HH",
  ])
  assert.ok(Math.abs(affinity - 1 / 3) < 1e-9)
})
