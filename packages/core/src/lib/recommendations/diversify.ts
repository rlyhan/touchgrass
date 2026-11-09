import { ActivityField, ActivityType, ScoredRecommendation } from "@touchgrass/types"
import { BucketedRecommendation, classifyBucket, TOP_BUCKET_MIN_SCORE } from "./interests/buckets.js"
import { pickOnePerInterest } from "./interests/interest-pass.js"

/*
 * Diversifies the top recommendation slots and produces the final ordering.
 *
 * Two layered passes fill the top slots:
 *   Pass 1 — Interest diversification (runs whenever the user has >= 1 interest):
 *     For each user interest (in input order), pick the highest-`sortScore` Top-bucket rec whose
 *     `field` matches that interest. Type uniqueness is NOT enforced inside this pass — two
 *     interest fields may share the same activity type — but each chosen rec's type is recorded
 *     so Pass 2 can avoid duplicating it.
 *   Pass 2 — Activity-type diversification (always runs):
 *     Walk the high-`sortScore` pool (remaining Top ∪ Middle with `sortScore >= 0.6`) in order
 *     and pick the first rec for each previously-unseen activity type.
 *
 * After the picks, the remaining recs are appended in bucket order (Top → Middle → Bottom).
 * Within each bucket, recs are sorted by `sortScore` descending — for Middle this means the
 * low-score-in-interest entries compete with the high-score-off-interest entries via the
 * sort-only `+0.1` boost (the persisted `score` is unchanged).
 */
export function diversifyAndOrder(
    scored: ScoredRecommendation[],
    interests: ActivityField[],
): ScoredRecommendation[] {
    const interestSet = new Set<ActivityField>(interests)
    const bucketed = scored.map((s) => classifyBucket(s, interestSet))

    const top = bucketed
        .filter((b) => b.bucket === "top")
        .sort((a, b) => b.sortScore - a.sortScore)
    const middle = bucketed
        .filter((b) => b.bucket === "middle")
        .sort((a, b) => b.sortScore - a.sortScore)
    const bottom = bucketed
        .filter((b) => b.bucket === "bottom")
        .sort((a, b) => b.sortScore - a.sortScore)

    // Pass 1: interest diversification — one rec per user interest, drawn from the Top bucket.
    const picks = pickOnePerInterest(top, interests)
    const pickedSlugs = new Set<string>(picks.map((p) => p.rec.slug))
    const seenTypes = new Set<ActivityType>(picks.map((p) => p.rec.type))

    // Pass 2: activity-type diversification over the remaining high-sortScore pool.
    const typeDiversifyPool: BucketedRecommendation[] = [
        ...top,
        ...middle.filter((m) => m.sortScore >= TOP_BUCKET_MIN_SCORE),
    ]
    for (const b of typeDiversifyPool) {
        if (pickedSlugs.has(b.rec.slug)) continue
        if (seenTypes.has(b.rec.type)) continue
        picks.push(b)
        pickedSlugs.add(b.rec.slug)
        seenTypes.add(b.rec.type)
    }

    const remaining: BucketedRecommendation[] = [
        ...top.filter((t) => !pickedSlugs.has(t.rec.slug)),
        ...middle.filter((m) => !pickedSlugs.has(m.rec.slug)),
        ...bottom.filter((bt) => !pickedSlugs.has(bt.rec.slug)),
    ]

    return [...picks, ...remaining].map((b) => ({ rec: b.rec, score: b.score }))
}
