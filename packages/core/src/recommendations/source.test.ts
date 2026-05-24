import { strict as assert } from "node:assert"
import { test } from "node:test"

import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"

import { createRecommendationLoader, type SanityActivity } from "./source.js"

test("returns all mocks when Sanity has no activities", async () => {
  const load = createRecommendationLoader(async () => [])

  const result = await load()

  assert.deepEqual(result, RECOMMENDATIONS)
})

test("Sanity activities with a matching slug override the mock's fields", async () => {
  const target = RECOMMENDATIONS[0]
  assert.ok(target, "expected at least one mock")
  const override: SanityActivity = {
    slug: target.slug,
    title: "Title From Sanity",
  }

  const result = await createRecommendationLoader(async () => [override])()

  const matched = result.find((r) => r.slug === target.slug)
  assert.ok(matched)
  assert.equal(matched.title, "Title From Sanity")
})

test("null/undefined Sanity fields fall through to the mock value", async () => {
  const target = RECOMMENDATIONS[0]
  assert.ok(target, "expected at least one mock")
  // Simulates a partially-migrated Sanity doc: title set, image not uploaded yet.
  const partial = {
    slug: target.slug,
    title: "Title From Sanity",
    imageUrl: null,
  } as unknown as SanityActivity

  const result = await createRecommendationLoader(async () => [partial])()

  const matched = result.find((r) => r.slug === target.slug)
  assert.ok(matched)
  assert.equal(matched.title, "Title From Sanity")
  assert.equal(matched.imageUrl, target.imageUrl)
})

test("Sanity-only activities (no matching mock) pass through as-is", async () => {
  const sanityOnly: SanityActivity = {
    slug: "brand-new-sanity-activity",
    title: "Brand New",
    imageUrl: "https://example.com/new.jpg",
    type: "Active",
    field: "Music",
    estimated_time: "1 hour",
  }

  const result = await createRecommendationLoader(async () => [sanityOnly])()

  assert.equal(result.length, RECOMMENDATIONS.length + 1)
  assert.equal(result[0]?.slug, "brand-new-sanity-activity")
})

test("instructions from Sanity are merged onto a matching mock", async () => {
  const target = RECOMMENDATIONS[0]
  assert.ok(target, "expected at least one mock")
  const override: SanityActivity = {
    slug: target.slug,
    title: target.title,
    instructions: [
      { title: "Step one", description: "Do the first thing." },
      { title: "Step two" },
    ],
  }

  const result = await createRecommendationLoader(async () => [override])()

  const matched = result.find((r) => r.slug === target.slug)
  assert.ok(matched)
  assert.deepEqual(matched.instructions, override.instructions)
})

test("null instructions from Sanity fall through to the mock's value", async () => {
  const target = RECOMMENDATIONS[0]
  assert.ok(target, "expected at least one mock")
  const partial = {
    slug: target.slug,
    title: target.title,
    instructions: null,
  } as unknown as SanityActivity

  const result = await createRecommendationLoader(async () => [partial])()

  const matched = result.find((r) => r.slug === target.slug)
  assert.ok(matched)
  assert.deepEqual(matched.instructions, target.instructions)
})

test("Sanity-only activities missing required Activity fields are dropped", async () => {
  // Only title + slug — missing imageUrl, type, field, estimated_time.
  const incomplete: SanityActivity = {
    slug: "incomplete-sanity-only",
    title: "Incomplete",
  }

  const result = await createRecommendationLoader(async () => [incomplete])()

  assert.equal(result.length, RECOMMENDATIONS.length)
  assert.ok(!result.find((r) => r.slug === "incomplete-sanity-only"))
})

test("merged result has no duplicates by slug", async () => {
  const target = RECOMMENDATIONS[0]
  assert.ok(target, "expected at least one mock")
  const override: SanityActivity = {
    slug: target.slug,
    title: "Override",
  }

  const result = await createRecommendationLoader(async () => [override])()

  const slugs = result.map((r) => r.slug)
  assert.equal(new Set(slugs).size, slugs.length)
})
