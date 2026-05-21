import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { Activity } from "@touchgrass/types"
import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"

import { createRecommendationLoader } from "./source.js"

const sanityActivity = (
  overrides: Partial<Activity> & { slug: string },
): Activity => ({
  title: "From Sanity",
  imageUrl: "https://example.com/image.jpg",
  type: "Active",
  field: "Music",
  estimated_time: "1 hour",
  ...overrides,
})

test("returns all mocks when Sanity has no activities", async () => {
  const load = createRecommendationLoader(async () => [])

  const result = await load()

  assert.deepEqual(result, RECOMMENDATIONS)
})

test("merges non-overlapping Sanity activities with the mocks", async () => {
  const fresh = sanityActivity({ slug: "brand-new-activity", title: "Brand New" })
  const load = createRecommendationLoader(async () => [fresh])

  const result = await load()

  assert.equal(result.length, RECOMMENDATIONS.length + 1)
  assert.equal(result[0], fresh)
  assert.ok(result.some((r) => r.slug === RECOMMENDATIONS[0]?.slug))
})

test("Sanity activities override mocks with the same slug", async () => {
  const overriddenSlug = RECOMMENDATIONS[0]?.slug
  assert.ok(overriddenSlug, "expected at least one mock to derive a slug from")
  const overridden = sanityActivity({
    slug: overriddenSlug,
    title: "Sanity Override",
  })
  const load = createRecommendationLoader(async () => [overridden])

  const result = await load()

  assert.equal(result.length, RECOMMENDATIONS.length)
  const matches = result.filter((r) => r.slug === overriddenSlug)
  assert.equal(matches.length, 1)
  assert.equal(matches[0]?.title, "Sanity Override")
})
