import { strict as assert } from "node:assert"
import { test } from "node:test"

import { onboardingFormSchema } from "./schema.js"

const validPayload = {
  name: "Ada Lovelace",
  birthdate: "1990-04-12",
  heightCm: "172",
  gender: "Female" as const,
  build: "Athletic" as const,
  location: "London",
  employment: "Employed" as const,
  interests: ["Music", "Coding"],
  personality: {
    Openness: 97,
    Intellect: 61,
    Industriousness: 63,
    Orderliness: 60,
    Enthusiasm: 16,
    Assertiveness: 19,
    Compassion: 91,
    Politeness: 83,
    Volatility: 68,
    Withdrawal: 63,
  },
  motivations: ["explore_creative", "learn_think_grow"],
}

test("accepts a fully populated valid payload", () => {
  const result = onboardingFormSchema.safeParse(validPayload)
  assert.equal(result.success, true)
})

test("accepts nullable enum fields when null", () => {
  const result = onboardingFormSchema.safeParse({
    ...validPayload,
    gender: null,
    build: null,
    employment: null,
  })
  assert.equal(result.success, true)
})

test("rejects empty name", () => {
  const result = onboardingFormSchema.safeParse({ ...validPayload, name: "" })
  assert.equal(result.success, false)
})

test("rejects malformed birthdate", () => {
  const result = onboardingFormSchema.safeParse({
    ...validPayload,
    birthdate: "4/12/1990",
  })
  assert.equal(result.success, false)
})

test("rejects non-numeric heightCm", () => {
  const result = onboardingFormSchema.safeParse({
    ...validPayload,
    heightCm: "tall",
  })
  assert.equal(result.success, false)
})

test("rejects unknown interest", () => {
  const result = onboardingFormSchema.safeParse({
    ...validPayload,
    interests: ["Underwater Basket Weaving"],
  })
  assert.equal(result.success, false)
})

test("rejects out-of-range BFAS score", () => {
  const result = onboardingFormSchema.safeParse({
    ...validPayload,
    personality: { ...validPayload.personality, Openness: 150 },
  })
  assert.equal(result.success, false)
})

test("rejects empty motivations array", () => {
  const result = onboardingFormSchema.safeParse({
    ...validPayload,
    motivations: [],
  })
  assert.equal(result.success, false)
})

test("rejects missing BFAS trait", () => {
  const { Withdrawal: _omitted, ...incomplete } = validPayload.personality
  const result = onboardingFormSchema.safeParse({
    ...validPayload,
    personality: incomplete,
  })
  assert.equal(result.success, false)
})
