import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { Activity, ActivityField, ActivityType, ScoredRecommendation } from "@touchgrass/types"

import { diversifyAndOrder } from "./diversify.js"

const makeRec = (
  slug: string,
  field: ActivityField,
  type: ActivityType,
  score: number,
): ScoredRecommendation => ({
  rec: {
    slug,
    title: slug,
    imageUrl: "",
    type,
    field,
    estimated_time: "",
  } satisfies Activity,
  score,
})

test("diversifyAndOrder with no interests sorts purely by score (no Top bucket exists)", () => {
  const scored = [
    makeRec("a", "Music", "Reflective", 0.9),
    makeRec("b", "Coding", "Analytical", 0.7),
    makeRec("c", "Art", "Creative", 0.5),
    makeRec("d", "Writing", "Reflective", 0.3),
  ]
  const result = diversifyAndOrder(scored, [])
  // With 0 interests: Top is empty. Activity-type diversification on Middle high-score subset
  // picks one per type. Final order respects bucket priority (Middle >= 0.6 first, then Bottom).
  assert.deepEqual(
    result.map((r) => r.rec.slug),
    ["a", "b", "c", "d"],
  )
})

test("diversifyAndOrder places Top bucket recs before Middle and Bottom", () => {
  const interests: ActivityField[] = ["Music"]
  const scored = [
    makeRec("middle-high", "Coding", "Analytical", 0.85), // Middle (high score, off-interest)
    makeRec("top", "Music", "Reflective", 0.7),           // Top (high score + in interest)
    makeRec("bottom", "Art", "Creative", 0.3),            // Bottom
  ]
  const result = diversifyAndOrder(scored, interests)
  assert.equal(result[0]?.rec.slug, "top")
  assert.equal(result[result.length - 1]?.rec.slug, "bottom")
})

test("diversifyAndOrder Top bucket requires both score >= 0.6 AND field in interests", () => {
  const interests: ActivityField[] = ["Music"]
  const scored = [
    makeRec("low-in-interest", "Music", "Reflective", 0.45), // Middle (boosted to 0.55 sortScore)
    makeRec("high-off-interest", "Coding", "Analytical", 0.9), // Middle (sortScore 0.9)
    makeRec("top", "Music", "Reflective", 0.65),               // Top
  ]
  const result = diversifyAndOrder(scored, interests)
  assert.equal(result[0]?.rec.slug, "top", "Top bucket rec should lead")
})

test("diversifyAndOrder Middle competition: +0.1 boost lets a low-score interest rec beat a high-score non-interest rec", () => {
  const interests: ActivityField[] = ["Music"]
  const scored = [
    makeRec("low-interest", "Music", "Reflective", 0.55),       // Middle, sortScore 0.65
    makeRec("high-non-interest", "Coding", "Analytical", 0.62), // Middle, sortScore 0.62
  ]
  const result = diversifyAndOrder(scored, interests)
  // Both are Middle; low-interest with boost (0.65) beats high-non-interest (0.62).
  assert.deepEqual(
    result.map((r) => r.rec.slug),
    ["low-interest", "high-non-interest"],
  )
})

test("diversifyAndOrder Middle competition: a strong non-interest rec still beats a boosted low-score interest rec when the boost isn't enough", () => {
  const interests: ActivityField[] = ["Music"]
  const scored = [
    makeRec("low-interest", "Music", "Reflective", 0.41),       // Middle, sortScore 0.51
    makeRec("high-non-interest", "Coding", "Analytical", 0.85), // Middle, sortScore 0.85
  ]
  const result = diversifyAndOrder(scored, interests)
  assert.deepEqual(
    result.map((r) => r.rec.slug),
    ["high-non-interest", "low-interest"],
  )
})

test("diversifyAndOrder Middle boost is sort-only and does not mutate the persisted score", () => {
  const interests: ActivityField[] = ["Music"]
  const scored = [makeRec("low-interest", "Music", "Reflective", 0.5)]
  const result = diversifyAndOrder(scored, interests)
  assert.equal(result[0]?.score, 0.5, "score should remain 0.5 (no +0.1 mutation)")
})

test("diversifyAndOrder Bottom bucket: recs that fail both score and interest thresholds appear last in score order", () => {
  const interests: ActivityField[] = ["Music"]
  const scored = [
    makeRec("bottom-a", "Coding", "Analytical", 0.35),
    makeRec("bottom-b", "Art", "Creative", 0.2),
    makeRec("middle", "Coding", "Analytical", 0.7),
  ]
  const result = diversifyAndOrder(scored, interests)
  assert.deepEqual(
    result.map((r) => r.rec.slug),
    ["middle", "bottom-a", "bottom-b"],
  )
})

test("diversifyAndOrder with >=3 interests: top slots are one per distinct user interest", () => {
  const interests: ActivityField[] = ["Music", "Writing", "Coding"]
  const scored = [
    makeRec("music-best", "Music", "Reflective", 0.9),
    makeRec("music-second", "Music", "Creative", 0.85),
    makeRec("writing-best", "Writing", "Reflective", 0.8),
    makeRec("coding-best", "Coding", "Analytical", 0.75),
    makeRec("off-interest", "Art", "Creative", 0.88), // Middle (off-interest)
  ]
  const result = diversifyAndOrder(scored, interests)
  // Top three should be one-per-interest, drawn from Top bucket in score order.
  const topThreeIds = result.slice(0, 3).map((r) => r.rec.slug)
  assert.deepEqual(topThreeIds, ["music-best", "writing-best", "coding-best"])
  // The duplicate-interest rec ("music-second") goes to remaining Top, ahead of Middle "off-interest".
  assert.equal(result[3]?.rec.slug, "music-second")
  assert.equal(result[4]?.rec.slug, "off-interest")
})

test("diversifyAndOrder with >=3 interests does NOT diversify by activity type within Top", () => {
  // Two Top-bucket recs share the same activity type but different interest fields:
  // both should still surface in the top slots under interest diversification.
  const interests: ActivityField[] = ["Music", "Writing", "Coding"]
  const scored = [
    makeRec("music", "Music", "Reflective", 0.9),
    makeRec("writing", "Writing", "Reflective", 0.85), // same type as `music`
    makeRec("coding", "Coding", "Analytical", 0.7),
  ]
  const result = diversifyAndOrder(scored, interests)
  assert.deepEqual(
    result.map((r) => r.rec.slug),
    ["music", "writing", "coding"],
  )
})

test("diversifyAndOrder with 2 interests: interest pass still surfaces every interest field even when types collide", () => {
  const interests: ActivityField[] = ["Music", "Writing"]
  const scored = [
    makeRec("music", "Music", "Reflective", 0.9),
    makeRec("writing", "Writing", "Reflective", 0.85), // same type as `music`
    makeRec("coding", "Coding", "Analytical", 0.7),    // Middle (off-interest, score >= 0.6)
  ]
  const result = diversifyAndOrder(scored, interests)
  // Pass 1 picks music (Music) then writing (Writing), both Reflective — type collision allowed.
  // Pass 2 picks coding (Analytical, unseen type) from Middle high-score pool.
  assert.deepEqual(
    result.map((r) => r.rec.slug),
    ["music", "writing", "coding"],
  )
})

test("diversifyAndOrder with 1 interest: interest pass picks the best Top rec, then activity-type fills remaining slots", () => {
  const interests: ActivityField[] = ["Music"]
  const scored = [
    makeRec("a-music", "Music", "Reflective", 0.9),     // Top
    makeRec("b-music", "Music", "Reflective", 0.8),     // Top (same type as a-music)
    makeRec("c-coding", "Coding", "Analytical", 0.85),  // Middle (off-interest, high score)
  ]
  const result = diversifyAndOrder(scored, interests)
  // Pass 1 picks a-music for "Music" (Reflective recorded).
  // Pass 2 walks remaining Top + Middle≥0.6: skips b-music (Reflective seen), picks c-coding (Analytical).
  // Remaining: Top (b-music) → Middle (none left) → Bottom.
  assert.deepEqual(
    result.map((r) => r.rec.slug),
    ["a-music", "c-coding", "b-music"],
  )
})

test("diversifyAndOrder with 0 interests skips the interest pass and diversifies by activity type over the high-score Middle pool", () => {
  const scored = [
    makeRec("a", "Coding", "Analytical", 0.9),    // Middle (no interests, so off-interest)
    makeRec("b", "Coding", "Analytical", 0.8),    // Middle (same type — skipped)
    makeRec("c", "Art", "Creative", 0.75),        // Middle (different type — picked)
    makeRec("d", "Music", "Reflective", 0.3),     // Bottom
  ]
  const result = diversifyAndOrder(scored, [])
  // Top is empty. Pass 1 is a no-op. Pass 2 pool = Middle high-score (a, b, c).
  // Picks: a (Analytical), c (Creative). Remaining Middle: b. Then Bottom: d.
  assert.deepEqual(
    result.map((r) => r.rec.slug),
    ["a", "c", "b", "d"],
  )
})

test("diversifyAndOrder final ordering follows Top → Middle → Bottom across the full list", () => {
  const interests: ActivityField[] = ["Music", "Writing", "Coding"]
  const scored = [
    makeRec("top", "Music", "Reflective", 0.7),
    makeRec("middle", "Art", "Creative", 0.65),       // off-interest, high score
    makeRec("bottom", "Theater", "Performative", 0.2),
  ]
  const result = diversifyAndOrder(scored, interests)
  assert.deepEqual(
    result.map((r) => r.rec.slug),
    ["top", "middle", "bottom"],
  )
})
