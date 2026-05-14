import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { BFASScores } from "@touchgrass/types"

import { getOCEANScores } from "./ocean.js"

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
