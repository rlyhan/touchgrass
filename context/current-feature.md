# Rank user's top 6 activity types by pattern affinity

## Summary

Currently, the top recommendations are often omitting the same type, eg. "Reflective" for someone top scoring in "Intellectual Explorer".

To get a variety of recommendations, we should make sure that in a set of 3 recommendations:
- Each has a different primary type (eg. Reflective, Creative, Active)
- Each has a different #1 pattern type alignment (eg. no more than 1 can be best-aligned with 1-LH)

We should get the top 6 activity types for the user based on their pattern types to narrow down our options.

We should then randomise the results that come through.

## Parent Branch
recommendation-engine-v1

## Requirements

This subfeature is the foundation for the diversity work: produce a ranked list of the user's top 6 activity types based on their pattern strengths, which downstream steps will use to constrain and diversify recommendations.

- Score every activity type (e.g. Reflective, Creative, Active, ...) against the user's pattern strengths using the same `calculateActivityPatternAffinity` mechanism currently applied per-recommendation.
- Return the top 6 activity types ordered by descending affinity score.
- Expose this as a reusable helper in `packages/core/src/lib/recommendation-algorithm.ts` (or a sibling module) so subsequent subfeatures (diversification, randomisation) can consume it.
- Do not yet change the `/recommendations` API response shape or the per-recommendation scoring path — that's left to follow-up subfeatures.

Out of scope for this subfeature:
- Enforcing distinct primary types or distinct #1 pattern alignments across the final 3 recs.
- Randomising the returned recommendations.
- Changing how individual recommendations are scored or sliced.

## Implementation

## Notes
