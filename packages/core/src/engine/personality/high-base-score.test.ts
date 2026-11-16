import { strict as assert } from "node:assert"
import { test } from "node:test"

import type { Activity, PatternTypeId } from "@touchgrass/types"

import { getHighBaseScoreActivities } from "./high-base-score.js"

const makeRec = (
  type: Activity["type"],
  related_types?: Activity["related_types"],
  slug = "test",
): Activity => ({
  slug,
  title: "Test",
  imageUrl: "",
  field: "Art",
  estimated_time: "1h",
  type,
  related_types,
})

test("getHighBaseScoreActivities keeps only activities strictly above the mean base score plus one standard deviation", () => {
  // Creative's patterns all weigh 1 and the others' 0, so base scores are 1, 0, 0 → cutoff ≈ 0.80
  const weights = { "4-HH": 1, "9-HH": 1, "7-LH": 1 } as Record<PatternTypeId, number>
  const activities = [makeRec("Creative", undefined, "creative"), makeRec("Physical", undefined, "physical"), makeRec("Social", undefined, "social")]
  assert.deepEqual(getHighBaseScoreActivities(weights, activities).map((rec) => rec.slug), ["creative"])
})

test("getHighBaseScoreActivities keeps nothing when every base score is equal, since the cutoff is strict", () => {
  const weights = {} as Record<PatternTypeId, number>
  const activities = [makeRec("Creative", undefined, "creative"), makeRec("Physical", undefined, "physical")]
  assert.deepEqual(getHighBaseScoreActivities(weights, activities), [])
})
