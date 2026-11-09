import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { Activity, ActivityField, ScoredRecommendation } from "@touchgrass/types"

import { classifyBucket } from "./buckets.js"

const makeScored = (field: ActivityField, score: number): ScoredRecommendation => ({
  rec: {
    slug: "test",
    title: "Test",
    imageUrl: "",
    type: "Creative",
    field,
    estimated_time: "",
  } satisfies Activity,
  score,
})

const musicInterest = new Set<ActivityField>(["Music"])

test("classifyBucket puts an interest-field rec scoring 0.6+ in top", () => {
  const bucketed = classifyBucket(makeScored("Music", 0.6), musicInterest)
  assert.equal(bucketed.bucket, "top")
  assert.equal(bucketed.sortScore, 0.6)
})

test("classifyBucket puts a non-interest rec scoring 0.6+ in middle with no boost", () => {
  const bucketed = classifyBucket(makeScored("Coding", 0.9), musicInterest)
  assert.equal(bucketed.bucket, "middle")
  assert.equal(bucketed.sortScore, 0.9)
})

test("classifyBucket puts an interest-field rec scoring 0.4–0.6 in middle with +0.1 on sortScore only", () => {
  const bucketed = classifyBucket(makeScored("Music", 0.4), musicInterest)
  assert.equal(bucketed.bucket, "middle")
  assert.ok(Math.abs(bucketed.sortScore - 0.5) < 1e-9, `expected 0.5, got ${bucketed.sortScore}`)
  assert.equal(bucketed.score, 0.4)
})

test("classifyBucket puts a non-interest rec below 0.6 in bottom", () => {
  assert.equal(classifyBucket(makeScored("Coding", 0.59), musicInterest).bucket, "bottom")
})

test("classifyBucket puts an interest-field rec below 0.4 in bottom", () => {
  assert.equal(classifyBucket(makeScored("Music", 0.39), musicInterest).bucket, "bottom")
})

test("classifyBucket puts nothing in top when the user has no interests", () => {
  assert.equal(classifyBucket(makeScored("Music", 0.95), new Set()).bucket, "middle")
})
