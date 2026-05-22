import { strict as assert } from "node:assert"
import { test } from "node:test"

import {
  createFetchActivitiesFromSanity,
  readSanityConfigFromEnv,
} from "./sanity-source.js"
import type { SanityActivity } from "./source.js"

test("createFetchActivitiesFromSanity returns activities from the injected client", async () => {
  const sanityActivity: SanityActivity = {
    slug: "from-sanity",
    title: "From Sanity",
  }
  const fakeClient = {
    fetch: async <T,>(_query: string): Promise<T> => [sanityActivity] as T,
  }

  const fetchActivities = createFetchActivitiesFromSanity(fakeClient)
  const result = await fetchActivities()

  assert.deepEqual(result, [sanityActivity])
})

test("createFetchActivitiesFromSanity falls back to [] on fetch error", async () => {
  const fakeClient = {
    fetch: async <T,>(_query: string): Promise<T> => {
      throw new Error("Sanity is down")
    },
  }

  const fetchActivities = createFetchActivitiesFromSanity(fakeClient)
  const result = await fetchActivities()

  assert.deepEqual(result, [])
})

test("readSanityConfigFromEnv throws when SANITY_PROJECT_ID is missing", () => {
  const original = { ...process.env }
  delete process.env.SANITY_PROJECT_ID
  process.env.SANITY_DATASET = "production"
  process.env.SANITY_API_VERSION = "2024-01-01"

  try {
    assert.throws(
      () => readSanityConfigFromEnv(),
      /SANITY_PROJECT_ID is not set/,
    )
  } finally {
    process.env = original
  }
})

test("readSanityConfigFromEnv returns the config when all vars are set", () => {
  const original = { ...process.env }
  process.env.SANITY_PROJECT_ID = "test-project"
  process.env.SANITY_DATASET = "test-dataset"
  process.env.SANITY_API_VERSION = "2024-01-01"

  try {
    const config = readSanityConfigFromEnv()
    assert.equal(config.projectId, "test-project")
    assert.equal(config.dataset, "test-dataset")
    assert.equal(config.apiVersion, "2024-01-01")
  } finally {
    process.env = original
  }
})
