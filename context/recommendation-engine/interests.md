## Interests

Interests change the **order** of the recommendations screen: they push activities in the user's chosen fields towards the top. They never change a score.

Code: [`packages/core/src/lib/recommendations/interests/`](../../packages/core/src/lib/recommendations/interests/), with a `.test.ts` next to each file. Both pieces are used by `diversifyAndOrder` in [`diversify.ts`](../../packages/core/src/lib/recommendations/diversify.ts).

- **Affects:** the order of the 10 activities on the recommendations screen.
- **Never affects:** any activity's score, so neither the final score nor `recommendedSlugs` (browse's "Recommended for you").
- **Depends on:** the final score from [Personality](personality.md) + [Motivation](motivation.md).

---

## Inputs

Optional. The user picks any number of activity fields (`ACTIVITY_FIELDS`, e.g. Music, Film, Cooking) by tapping chips in onboarding. The stored list is in **tap order**: tapping a chip appends it, and tapping again removes it. Users don't rank their interests, but this order is kept all the way to the algorithm. Invalid fields are dropped by the recommendations route. An activity matches an interest when its `field` equals it.

---

## How it works

### 1. Buckets — `buckets.ts`

Each scored activity is placed in a bucket by `classifyBucket`:

| Condition | Bucket | `sortScore` |
|---|---|---|
| score ≥ 0.6 and field is an interest | top | score |
| score ≥ 0.6 and field isn't an interest | middle | score |
| score 0.4–0.6 and field is an interest | middle | score + 0.1 |
| anything else | bottom | score |

`sortScore` is only used for ordering; the activity's `score` is never changed. Without interests, top is always empty.

### 2. Interest pass — `interest-pass.ts`

`pickOnePerInterest` takes the best top-bucket activity for each interest, going through the interests in their stored (tap) order. These become the first slots on the recommendations screen, so the first interest the user tapped gets the first slot.

### What happens next (not interest logic)

`diversifyAndOrder` then picks the first activity of each activity type not yet shown (from top plus middle with `sortScore` ≥ 0.6), and appends everything else top → middle → bottom by `sortScore`.

---

## Edge cases

- **Interests never change a score.** The +0.1 only applies to `sortScore` (`diversify.test.ts`, `buckets.test.ts`), and `recommendedSlugs` is identical with no interests or every interest (`factor-contracts.test.ts`).
- **Without interests, there's no top bucket and no interest pass.** (`buckets.test.ts`, `interest-pass.test.ts`, `diversify.test.ts`)
- **The 0.6 cutoff rarely filters anything in practice.** It was written when scores ran 0–1, but the motivation boost lifts every boosted activity well above it, and most unboosted ones are above it too. So nearly every interest-field activity lands in top, whatever its score, and the 0.4–0.6 band only catches interest-field activities with no motivation boost and a poor personality fit. This is why weak interest-field activities can outrank much stronger non-interest ones on the recommendations screen. Documented here, not tested, because it depends on real score ranges; fixing the bucket scale is a separate change.
- **Interest picks follow tap order, not score.** The first interest tapped in onboarding gets the first slot, even if another interest's best activity scores higher. This isn't a deliberate ranking by the user; ordering picks by score would remove it but changes the recommendations screen, so it's a separate fix. (`interest-pass.test.ts`)
- **An interest with no top-bucket activity is skipped**, not filled from another bucket. (`interest-pass.test.ts`)
- **Two interest picks can share an activity type.** The type pass that follows then skips those types. (`interest-pass.test.ts`, `diversify.test.ts`)
- **An interest listed twice gets two picks** (its best and second-best activity). The app can't produce this, since tapping a chip again removes it; it could only come from a direct API call. (`interest-pass.test.ts`)
