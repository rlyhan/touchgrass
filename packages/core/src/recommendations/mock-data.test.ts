import { strict as assert } from "node:assert"
import { test } from "node:test"

import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import { ACTIVITY_TYPES, ACTIVITY_TYPE_PATTERNS } from "@touchgrass/types/constants"

// The recommendation algorithm looks up each activity's primary `type` and every
// `related_types` entry in ACTIVITY_TYPE_PATTERNS, falling back to [] on a miss
// (recommendation-algorithm.ts). A typo'd type therefore contributes zero pattern
// affinity *silently* rather than erroring — exactly the failure mode a bulk hand-edit
// of the mock catalog can introduce. These tests guard the catalog's value integrity.

const VALID_TYPES = new Set<string>(ACTIVITY_TYPES)

test("every mock activity has a valid primary type", () => {
  for (const activity of RECOMMENDATIONS) {
    assert.ok(
      VALID_TYPES.has(activity.type),
      `"${activity.slug}" has invalid type "${activity.type}"`,
    )
  }
})

test("every related_types entry is a valid ActivityType", () => {
  for (const activity of RECOMMENDATIONS) {
    for (const related of activity.related_types ?? []) {
      assert.ok(
        VALID_TYPES.has(related),
        `"${activity.slug}" has invalid related_type "${related}"`,
      )
    }
  }
})

test("every mock type resolves to a non-empty pattern set (no silent zero-affinity)", () => {
  for (const activity of RECOMMENDATIONS) {
    const primaryPatterns = ACTIVITY_TYPE_PATTERNS[activity.type] ?? []
    assert.ok(
      primaryPatterns.length > 0,
      `"${activity.slug}" type "${activity.type}" maps to no patterns`,
    )
    for (const related of activity.related_types ?? []) {
      assert.ok(
        (ACTIVITY_TYPE_PATTERNS[related] ?? []).length > 0,
        `"${activity.slug}" related_type "${related}" maps to no patterns`,
      )
    }
  }
})

test("related_types contains no duplicates and never repeats the primary type", () => {
  for (const activity of RECOMMENDATIONS) {
    const related = activity.related_types ?? []

    assert.equal(
      new Set(related).size,
      related.length,
      `"${activity.slug}" has duplicate related_types entries`,
    )
    assert.ok(
      !related.includes(activity.type),
      `"${activity.slug}" lists its primary type "${activity.type}" in related_types`,
    )
  }
})

test("mock activities have unique slugs", () => {
  const slugs = RECOMMENDATIONS.map((a) => a.slug)
  assert.equal(new Set(slugs).size, slugs.length, "mock catalog has duplicate slugs")
})
