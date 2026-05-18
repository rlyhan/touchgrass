# Show diversity by interests in top recommendations

## Summary

Currently, the interest boost is applied after diversification.

The logic needs to change so that after the initial base score (including motivation boosting), we need to get the user's interests, and prioritise showing one activity per interest in the top results, falling back on activity type when running out of interest. 

Any rec's that already have a match score >= 0.60 + its activity field is part of user's selected interests, are placed in the top results.

Any rec's matching less than 0.6 but its activity field is part of user's selected interests, goes through a weighting competition against rec's that do have a match score >= 0.6 but field isn't part of user's selected interests.

Priority order:

1. Score >= 0.6 && activity_field.includes(users_interests)
2. Score >= 0.6 | activity_field.includes(users_interests) where score >= 0.4 && score < 0.6 gets a boost of 0.1
3. The rest, sorted in natural rec score order


## Parent Branch
recommendation-engine-v1

## Requirements

- Apply the interest-based diversification step **after** the base score (including motivation boosting) is calculated, replacing the current behavior where the interest boost runs after activity-type diversification.
- Retrieve the user's selected interests as input.
- **Interest-based diversification (always runs when user has >= 1 selected interest):**
  - For each user interest (in input order), pick the highest-scoring Top-bucket rec whose `activity_field` matches that interest. Type uniqueness is NOT enforced inside this pass — two interest fields may share the same activity type.
  - Record each picked rec's activity type so the activity-type pass below avoids duplicates.
- **Activity-type diversification (always runs after the interest pass):**
  - Walk the remaining high-`sortScore` pool (leftover Top + Middle with `sortScore >= 0.6`) and pick the first rec whose activity type hasn't been picked yet.
  - With 0 interests this is the only pass that runs, matching the prior activity-type strategy.
- **Bucket priority (used to rank candidates within the interest-diversification pass and as the overall ordering rule):**
  1. **Top bucket** — `score >= 0.6` AND `activity_field` is in the user's selected interests.
  2. **Middle bucket (weighting competition)** — combined pool of:
     - `score >= 0.6` AND `activity_field` NOT in user's interests, and
     - `0.4 <= score < 0.6` AND `activity_field` IS in user's interests; these receive a `+0.1` boost for the competition.
     - Sort this bucket by post-boost score, descending.
  3. **Bottom bucket** — everything else, sorted in natural recommendation score order.
- Final ordering after diversification: Top → Middle → Bottom.
- The `+0.1` boost is sort-only; do not mutate the persisted recommendation score unless an existing pattern dictates otherwise.
- Add/extend unit tests covering: one-per-interest interest-pass behavior (with multiple interests, including the type-collision case where two interest fields share an activity type), the interest-pass-plus-activity-type-fill case (1 interest), the 0-interest activity-type-only path, top-bucket inclusion, middle-bucket competition (boosted vs. unboosted), and bottom-bucket fallback.

## Implementation

- [packages/core/src/lib/recommendation-algorithm.ts](packages/core/src/lib/recommendation-algorithm.ts)
  - Added `classifyBucket` (exported) — classifies a `ScoredRecommendation` into `top` / `middle` / `bottom` using thresholds `TOP_BUCKET_MIN_SCORE=0.6`, `MIDDLE_BUCKET_MIN_SCORE=0.4`, and `MIDDLE_INTEREST_BOOST=0.1`. `sortScore` is the score used to rank within a bucket — only Middle in-interest gets the `+0.1` boost; the original `score` is preserved on the rec.
  - Replaced the old `getDiverseRecommendations` + `applyInterestBoost` pipeline with a single `diversifyAndOrder(scored, interests)` (exported) that runs two layered passes:
    - **Pass 1 — interest diversification (whenever `interests.length >= 1`):** for each user interest, pick the highest-`sortScore` Top-bucket rec with that `field`. Type uniqueness is NOT enforced inside Pass 1, but each picked type is recorded so Pass 2 avoids duplicates.
    - **Pass 2 — activity-type diversification (always runs):** walk remaining Top + Middle with `sortScore >= 0.6` and pick the first rec of each previously-unseen activity type.
    - After picks, remaining recs are appended in Top → Middle → Bottom order. Each bucket is internally sorted by `sortScore` descending, so the Middle competition (boosted in-interest vs. high-score off-interest) plays out via the sort step alone.
  - `getRecommendations` now calls `diversifyAndOrder(scoredRecommendations, interests).slice(0, MAX_RECOMMENDATIONS)` directly after scoring + motivation boost.
  - Removed the dev `console.log` from the previous `getDiverseRecommendations` along with the unused `MIN_PRIMARY_AFFINITY_FOR_STRONG_MATCH` (0.65) constant — the new logic uses `TOP_BUCKET_MIN_SCORE = 0.6`.
- [packages/core/src/lib/recommendation-algorithm.test.ts](packages/core/src/lib/recommendation-algorithm.test.ts)
  - Added synthetic-data unit tests around `diversifyAndOrder` covering: bucket placement, Top/Middle/Bottom ordering, Middle weighting competition (boost wins / boost insufficient), score preservation, one-per-interest diversification (`>= 3` interests), interest-pass-surfaces-all-fields with type collision (`2` interests), interest-pass-plus-type-fill (`1` interest), and the `0`-interests activity-type-only path.
  - Retained the `getRecommendations` shape tests and all `getTopActivityTypes` tests.

## Notes

- The eligibility filter for fallback uses `sortScore >= TOP_BUCKET_MIN_SCORE` (not raw `score`). This is what lets a boosted in-interest Middle rec (score 0.55 → sortScore 0.65) qualify alongside a same-bucket off-interest rec (score 0.62), so the Middle competition rule still applies when interest-diversification isn't triggered.
