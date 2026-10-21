import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { PatternType } from "@touchgrass/types"

import {
  calculatePatternDistance,
  getAdjacentPatterns,
  MATCH_WEIGHTS,
} from "./patterns.js"

// ─── calculatePatternDistance ────────────────────────────────────────────────

const makePattern = (
  id: string,
  levelA: "H" | "L",
  levelB: "H" | "L",
): PatternType => ({
  id: id as PatternType["id"],
  groupId: 1,
  name: "test",
  shortDescription: "",
  traitA: { trait: "Extraversion", level: levelA },
  traitB: { trait: "Agreeableness", level: levelB },
})

test("calculatePatternDistance returns 0 for identical patterns", () => {
  const p = makePattern("1-HH", "H", "H")
  assert.equal(calculatePatternDistance(p, p), 0)
})

test("calculatePatternDistance returns 1 when only traitA polarity differs", () => {
  assert.equal(
    calculatePatternDistance(makePattern("1-HH", "H", "H"), makePattern("1-LH", "L", "H")),
    1,
  )
})

test("calculatePatternDistance returns 1 when only traitB polarity differs", () => {
  assert.equal(
    calculatePatternDistance(makePattern("1-HH", "H", "H"), makePattern("1-HL", "H", "L")),
    1,
  )
})

test("calculatePatternDistance returns 2 when both trait polarities differ", () => {
  assert.equal(
    calculatePatternDistance(makePattern("1-HH", "H", "H"), makePattern("1-LL", "L", "L")),
    2,
  )
})

// ─── getAdjacentPatterns ───────────────────────────────────────────────────────

test("getAdjacentPatterns returns exactly 3 adjacent patterns for a 4-variant group", () => {
  // Each group has 4 variants (HH, HL, LH, LL); the target is excluded, leaving 3
  assert.equal(getAdjacentPatterns("1-HH").length, 3)
})

test("getAdjacentPatterns excludes the target pattern itself", () => {
  const adjacent = getAdjacentPatterns("1-HH")
  assert.ok(adjacent.every((t) => t.patternId !== "1-HH"))
})

test("getAdjacentPatterns only returns patterns from the same group", () => {
  // Group 1 contains: 1-HH, 1-HL, 1-LH, 1-LL
  const adjacent = getAdjacentPatterns("1-HH")
  assert.ok(adjacent.every((t) => t.patternId.startsWith("1-")))
})

test("getAdjacentPatterns assigns STRONG_ADJACENT weight to distance-1 patterns", () => {
  // 1-HH → 1-HL (traitB differs) and 1-LH (traitA differs) are both distance 1
  const adjacent = getAdjacentPatterns("1-HH")
  const strongNeighbours = adjacent.filter((t) => t.patternId === "1-HL" || t.patternId === "1-LH")
  assert.equal(strongNeighbours.length, 2)
  assert.ok(strongNeighbours.every((t) => t.weight === MATCH_WEIGHTS.STRONG_ADJACENT))
})

test("getAdjacentPatterns assigns WEAK_ADJACENT weight to the distance-2 pattern", () => {
  // 1-HH → 1-LL (both traits differ) is distance 2
  const adjacent = getAdjacentPatterns("1-HH")
  const weak = adjacent.find((t) => t.patternId === "1-LL")
  assert.ok(weak !== undefined)
  assert.equal(weak.weight, MATCH_WEIGHTS.WEAK_ADJACENT)
})
