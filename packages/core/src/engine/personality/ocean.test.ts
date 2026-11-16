import { strict as assert } from "node:assert"
import { test } from "node:test"

import { MOCK_USER_BFAS } from "@touchgrass/mocks/user"

import { getOCEANScores } from "./ocean.js"

test("getOCEANScores averages each pair of BFAS aspects into its parent trait", () => {
  const ocean = getOCEANScores(MOCK_USER_BFAS)
  // Groupings are driven by BFAS_TRAITS[n].parent — changing parent there changes these results
  assert.equal(ocean.Openness, 79)           // Openness(97) + Intellect(61)
  assert.equal(ocean.Conscientiousness, 61.5) // Industriousness(63) + Orderliness(60)
  assert.equal(ocean.Extraversion, 17.5)     // Enthusiasm(16) + Assertiveness(19)
  assert.equal(ocean.Agreeableness, 87)      // Compassion(91) + Politeness(83)
  assert.equal(ocean.Neuroticism, 65.5)      // Volatility(68) + Withdrawal(63)
})
