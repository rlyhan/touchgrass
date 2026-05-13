# Add motivation boost

## Summary

In packages/core/src/lib/motivation-boost.ts, we have a formula to calculate a match score boost for user's initial recommendations.

 Flow:
 * 1. User selects a motivation during onboarding flow, which is mapped to associated activity types (see packages/types/constants.ts - MOTIVATION_OPTIONS)
 * 2. Activity types map to NEO pattern IDs (see packages/types/constants.ts - ACTIVITY_TYPE_PATTERNS)
 * 3. User traits are compared against target patterns
 * 4. Boosts are applied using weighted similarity
 * 5. Boost is normalized and added to base activity score

Match Types:
 
EXACT MATCH
Same pattern ID
Example:
9-HH ↔ 9-HH

STRONG ADJACENT MATCH
Same groupId, differs by one polarity
Example:
4-HH ↔ 4-LH

WEAK ADJACENT MATCH
Same groupId, differs by both polarities
Example:
3-HL ↔ 3-LH

Weighting:

EXACT = 1.0
STRONG_ADJACENT = 0.65
WEAK_ADJACENT = 0.5

Final Formula:

finalScore = baseScore + normalizedMotivationBoost

Motivation Boost Formula:

motivationBoost = sum(exactMatches * EXACT_WEIGHT) + sum(adjacentMatches * ADJACENT_WEIGHT)

Adjacency is calculated dynamically using:
- shared groupId
- polarity distance

This should happen right before we use getDiverseRecommendations.

In the getRecommendationsHandler we need to pass motivations to our getRecommendations function.

Additionally, we need to push the Motivation object's value, rather than label.

## Parent Branch
feat/motivation-boost

## Requirements

- Implement motivation boost calculation in `packages/core/src/lib/motivation-boost.ts`
- Define match types and weights:
  - `EXACT` (same pattern ID): weight = 1.0
  - `STRONG_ADJACENT` (same groupId, differs by one polarity): weight = 0.65
  - `WEAK_ADJACENT` (same groupId, differs by both polarities): weight = 0.5
- Resolve user motivations to associated activity types via `MOTIVATION_OPTIONS` (`packages/types/constants.ts`)
- Resolve activity types to NEO pattern IDs via `ACTIVITY_TYPE_PATTERNS` (`packages/types/constants.ts`)
- Compute adjacency dynamically using shared `groupId` and polarity distance
- Compute `motivationBoost = sum(exactMatches * EXACT_WEIGHT) + sum(adjacentMatches * ADJACENT_WEIGHT)`
- Normalize the motivation boost and add to base activity score: `finalScore = baseScore + normalizedMotivationBoost`
- Apply motivation boost in the recommendation algorithm immediately before `getDiverseRecommendations`
- Update `getRecommendationsHandler` to pass user motivations through to `getRecommendations`
- Persist Motivation `value` (not `label`) on the user record from onboarding

## Implementation

## Notes
