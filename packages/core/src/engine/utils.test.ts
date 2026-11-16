import { strict as assert } from "node:assert"
import { test } from "node:test"

import { getMeanAndSd } from "./utils.js"

test("getMeanAndSd returns the mean and population standard deviation", () => {
  assert.deepEqual(getMeanAndSd([2, 4, 4, 4, 5, 5, 7, 9]), { mean: 5, sd: 2 })
})
