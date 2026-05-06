# Zod for Onboarding

## Summary

Implement Zod schema for the onboarding payload — mirror OnboardingFormValues as a zod schema. No endpoint yet — just the validator and a small unit check.

## Parent Branch
recommendation-engine-v1

## Requirements

- Add `zod` as a dependency to `@touchgrass/core`.
- Create a Zod schema in `packages/core/src` that mirrors `OnboardingFormValues` from `apps/mobile/lib/onboarding/types.ts`:
  - `name`: non-empty string
  - `birthdate`: string (ISO date format `YYYY-MM-DD`)
  - `heightCm`: string that parses to a positive integer (form sends string)
  - `gender`: enum of `"Male" | "Female" | "Non-binary" | "Prefer not to say"` or null
  - `build`: enum of `"Slim" | "Athletic" | "Average" | "Heavy"` or null
  - `location`: non-empty string
  - `employment`: enum of `"Student" | "Employed" | "Unemployed" | "Retired"` or null
  - `interests`: array of `ActivityField` values (from `@touchgrass/types`)
  - `personality`: `BFASScores` — record of all 10 BFAS traits, each a number between 0–100
  - `motivations`: array of strings
- Export the schema and a derived TS type from the core package so it can be imported by future endpoint code.
- Add a small unit check (test or runnable script) that validates a known-good payload passes and a known-bad payload fails.
- Do NOT wire up an HTTP endpoint yet — schema + validator only.

## Notes
- Our database is Neon (serverless Postgres database)
- DATABASE_URL that connects to Neon is in .env.local
- We are NOT handling auth yet, so once the onboarding data for a user is submitted, the session does not persist.