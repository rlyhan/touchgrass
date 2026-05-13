# Add interest boosting

## Summary

After the diversification step, we should boost recommendations that align with the user's selected interests. 

For example, if the user selected Music and Film as interests, then we re-order the set of recommendations so that all recommendations where Music and Film are the activity field are displayed before all the other recommendations, in descending order of their match score. All the other non-Music/Film recommendations are displayed after this in descending order of their match score.

## Parent Branch
recommendation-engine-v1

## Requirements

1. **Accept interests in `getRecommendations`** — Update the function signature in `packages/core/src/lib/recommendation-algorithm.ts` to accept `interests: ActivityField[]` as a third parameter alongside the existing `userTraits` and `motivations`.

2. **Partition after diversification** — After `getDiverseRecommendations` returns the diverse set, split the results into two groups:
   - **Interest matches**: recommendations where `rec.field` is in the `interests` array
   - **Others**: all remaining recommendations

3. **Sort each group independently** — Sort both groups in descending order of their `score`.

4. **Concatenate and return** — Return interest-match group first, followed by the others group. The `MAX_RECOMMENDATIONS` slice should apply to the combined result.

5. **Update call sites** — Update any callers of `getRecommendations` (e.g. the recommendations route) to pass the user's interests from their onboarding profile.

6. **Tests** — Add unit tests in `recommendation-algorithm.test.ts` (or create it) covering:
   - Interest-matching recommendations appear before non-matching ones
   - Within each group, ordering is descending by score
   - Empty interests array produces unchanged ordering (falls back to score-only sort)

## Implementation

- [`packages/core/src/lib/recommendation-algorithm.ts`](../packages/core/src/lib/recommendation-algorithm.ts)
  - Added `interests: ActivityField[]` parameter to `getRecommendations`.
  - New `applyInterestBoost` partitions the diverse set into interest-match + others (via a `Set<ActivityField>` membership check on each rec's `field`), sorts each group by descending score, and concatenates matches first.
  - Removed the internal `.slice(0, MAX_RECOMMENDATIONS)` from `getDiverseRecommendations` — it now returns the full one-per-type set so the boost can see candidates that would otherwise be truncated. The final cap is applied once in `getRecommendations`. Also dropped the dead `bestValues.length < MAX_RECOMMENDATIONS` branch, whose fill filter excluded every type that was already represented and therefore always added nothing.
  - Pipeline is now: score → diversify → boost → slice `MAX_RECOMMENDATIONS`.
- [`packages/core/src/recommendations/route.ts`](../packages/core/src/recommendations/route.ts) — narrows `profile.interests: string[]` down to known `ActivityField` values (mirroring how motivations are filtered against `MOTIVATION_OPTIONS`) and passes them through to `getRecommendations`.
- [`packages/core/src/lib/recommendation-algorithm.test.ts`](../packages/core/src/lib/recommendation-algorithm.test.ts) — updated existing call sites to pass `[]` for interests, and added four new tests:
  - All interest-matching recs appear before any non-matching rec.
  - Within the matching group, scores are non-increasing.
  - Within the non-matching group, scores are non-increasing.
  - Empty interests → result order matches a plain score-only sort.

## Notes

- The `ActivityField` narrowing in `route.ts` uses an `(ACTIVITY_FIELDS as readonly string[]).includes(i)` cast because `ActivityField[]` doesn't accept arbitrary strings for `.includes`. Aligns with the existing motivation-filter style.
- `MAX_RECOMMENDATIONS` is still 3 on this branch; the partition still applies meaningfully but with so few slots the visible effect is limited until that cap is raised.
