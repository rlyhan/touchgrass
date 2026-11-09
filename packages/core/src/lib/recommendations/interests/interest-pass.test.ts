import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { Activity, ActivityField, ActivityType } from "@touchgrass/types"

import type { BucketedRecommendation } from "./buckets.js"
import { pickOnePerInterest } from "./interest-pass.js"

const makeTop = (slug: string, field: ActivityField, type: ActivityType, score: number): BucketedRecommendation => ({
  rec: {
    slug,
    title: slug,
    imageUrl: "",
    type,
    field,
    estimated_time: "",
  } satisfies Activity,
  score,
  bucket: "top",
  sortScore: score,
})

const top = [
  makeTop("music-best", "Music", "Creative", 0.9),
  makeTop("music-second", "Music", "Creative", 0.85),
  makeTop("writing-best", "Writing", "Reflective", 0.8),
]

test("pickOnePerInterest picks the best top rec for each interest in the order the interests were given", () => {
  const picks = pickOnePerInterest(top, ["Writing", "Music"])
  assert.deepEqual(picks.map((p) => p.rec.slug), ["writing-best", "music-best"])
})

test("pickOnePerInterest skips an interest with no top rec", () => {
  const picks = pickOnePerInterest(top, ["Cooking", "Music"])
  assert.deepEqual(picks.map((p) => p.rec.slug), ["music-best"])
})

test("pickOnePerInterest allows two picks to share an activity type", () => {
  const sharedType = [
    makeTop("music", "Music", "Reflective", 0.9),
    makeTop("writing", "Writing", "Reflective", 0.8),
  ]
  const picks = pickOnePerInterest(sharedType, ["Music", "Writing"])
  assert.deepEqual(picks.map((p) => p.rec.slug), ["music", "writing"])
})

test("pickOnePerInterest picks the next best rec when an interest is listed twice", () => {
  const picks = pickOnePerInterest(top, ["Music", "Music"])
  assert.deepEqual(picks.map((p) => p.rec.slug), ["music-best", "music-second"])
})

test("pickOnePerInterest picks nothing when the user has no interests", () => {
  assert.deepEqual(pickOnePerInterest(top, []), [])
})
