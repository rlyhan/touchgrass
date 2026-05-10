import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { BFASScores, OCEANScores, PatternType } from "@touchgrass/types"

import {
  calculateActivityPatternAffinity,
  calculatePatternStrength,
  getOCEANScores,
} from "./helpers.js"

const baseBfas: BFASScores = {
  Openness: 80,
  Intellect: 60,
  Industriousness: 70,
  Orderliness: 50,
  Enthusiasm: 90,
  Assertiveness: 70,
  Compassion: 40,
  Politeness: 20,
  Volatility: 30,
  Withdrawal: 10,
}

test("getOCEANScores averages each pair of BFAS aspects into its parent trait", () => {
  const ocean = getOCEANScores(baseBfas)
  assert.equal(ocean.Openness, 70) // (80 + 60) / 2
  assert.equal(ocean.Conscientiousness, 60) // (70 + 50) / 2
  assert.equal(ocean.Extraversion, 80) // (90 + 70) / 2
  assert.equal(ocean.Agreeableness, 30) // (40 + 20) / 2
  assert.equal(ocean.Neuroticism, 20) // (30 + 10) / 2
})

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

test("calculatePatternStrength rewards matching H levels with high trait scores", () => {
  // Extraversion=70 → 0.7 ; Agreeableness=30 → 0.3 ; avg = 0.5
  assert.equal(calculatePatternStrength(userOcean, patternHH), 0.5)
})

test("calculatePatternStrength rewards matching L levels with low trait scores", () => {
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
  assert.equal(calculateActivityPatternAffinity({ "1-HH": 0.9 }, []), 0)
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
