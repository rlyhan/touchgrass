import { MOCK_USER_BFAS } from "@touchgrass/mocks/user"

import type { Profile } from "../db/schema/index.js"

export const AUTH_USER_ID = "auth_user_abc"

export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    authUserId: AUTH_USER_ID,
    name: "Ada Lovelace",
    birthdate: "1990-04-12",
    heightCm: 172,
    gender: "Female",
    build: "Athletic",
    location: "London",
    employment: "Employed",
    interests: ["Music", "Coding"],
    personality: MOCK_USER_BFAS,
    motivations: ["explore_creative", "learn_think_grow"],
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  }
}
