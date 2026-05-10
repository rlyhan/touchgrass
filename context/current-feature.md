# Use the NEO Pattern Types

## Summary

Change the algorithm to calculate user's alignment to activities through the NEO pattern types.

## Parent Branch
recommendation-engine-v1

## Requirements

- [x] Score recommendations against the user's NEO pattern strengths rather than against raw OCEAN traits.
- [x] Use each recommendation's primary `type` as the dominant signal, and its `related_types` as a secondary signal with a smaller weight.
- [x] Return recommendations sorted highest → lowest by score so the API route can take the top N.

## Implementation

- [`packages/core/src/lib/recommendation-algorithm.ts`](../packages/core/src/lib/recommendation-algorithm.ts) — filled in `getRecommendations`:
  1. Convert BFAS → OCEAN via `getOCEANScores`.
  2. Compute user pattern strengths across all 40 NEO pattern types via `getUserPatternStrengths`.
  3. For each recommendation, look up `ActivityTypePatterns[type]` for the primary set and the union of `ActivityTypePatterns[t]` for each `related_types` entry as the secondary set.
  4. Average the user's strength across each set via `calculateActivityPatternAffinity`.
  5. Combine: `primary * 0.7 + secondary * 0.3`, falling back to primary alone when the recommendation has no `related_types` (so an empty secondary list doesn't drag the score toward zero).
  6. Sort highest → lowest.
- [`context/recommendation-engine.md`](./recommendation-engine.md) — added an **Algorithm Flow** section documenting the four stages above, plus a note on inputs the engine doesn't yet consume (motivation, interests, human-curated `patternTypes`).

## Notes

- The primary/secondary split is the only weighting in this pass — motivation and interests are still unwired.
- Each recommendation also has a human-curated `patternTypes` field on the `Recommendation` type, but the algorithm currently only reads from `ActivityTypePatterns` keyed by `type` / `related_types`. Wiring curated patterns in (and deciding how they should override or blend with the inferred ones) is a follow-up.
