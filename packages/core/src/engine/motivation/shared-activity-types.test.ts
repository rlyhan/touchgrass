import { strict as assert } from "node:assert"
import { test } from "node:test"

import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { Activity, Motivation } from "@touchgrass/types"

import { getSharedActivityTypesBetweenActivityAndUserMotivations } from "./shared-activity-types.js"

const sharedTypesActivity: Activity = { ...RECOMMENDATIONS[0]!, type: "Outdoorsy", related_types: ["Social", "Reflective"] }
const sharedTypesMotivations: Motivation[] = [
  { value: "connect_with_people", label: "People", associated_activity_types: ["Social", "Collaborative"] },
  { value: "seek_adventure", label: "Adventure", associated_activity_types: ["Adventurous", "Outdoorsy", "Exploratory"] },
  { value: "challenge_push_myself", label: "Challenge", associated_activity_types: ["Competitive", "Physical"] },
  { value: "improve_wellbeing", label: "Wellbeing", associated_activity_types: ["Reflective", "Outdoorsy"] },
]

test("getSharedActivityTypesBetweenActivityAndUserMotivations lists only the types each motivation shares with the activity, leaving out motivations that share none", () => {
  assert.deepEqual(getSharedActivityTypesBetweenActivityAndUserMotivations(sharedTypesActivity, sharedTypesMotivations), {
    connect_with_people: ["Social"],
    seek_adventure: ["Outdoorsy"],
    improve_wellbeing: ["Reflective", "Outdoorsy"],
  })
})
