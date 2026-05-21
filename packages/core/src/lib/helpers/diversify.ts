import { ActivityField, ActivityType, ScoredRecommendation } from "@touchgrass/types"

type RecBucket = "top" | "middle" | "bottom"

export type BucketedRecommendation = ScoredRecommendation & {
    bucket: RecBucket
    sortScore: number
}

const TOP_BUCKET_MIN_SCORE = 0.6
const MIDDLE_BUCKET_MIN_SCORE = 0.4
const MIDDLE_INTEREST_BOOST = 0.1

/*
 * Classifies a scored recommendation into a priority bucket:
 *   - top:    score >= 0.6 AND field is one of the user's interests
 *   - middle: score >= 0.6 AND field is NOT an interest, OR
 *             score in [0.4, 0.6) AND field IS an interest (sortScore receives a +0.1 boost
 *             so it can compete against the high-score-but-off-interest recs in the same bucket)
 *   - bottom: everything else
 * `sortScore` is the value used to sort within a bucket; the original `score` is preserved.
 */
export function classifyBucket(
    scored: ScoredRecommendation,
    interestSet: Set<ActivityField>,
): BucketedRecommendation {
    const inInterest = interestSet.has(scored.rec.field)
    if (scored.score >= TOP_BUCKET_MIN_SCORE && inInterest) {
        return { ...scored, bucket: "top", sortScore: scored.score }
    }
    if (scored.score >= TOP_BUCKET_MIN_SCORE) {
        return { ...scored, bucket: "middle", sortScore: scored.score }
    }
    if (scored.score >= MIDDLE_BUCKET_MIN_SCORE && inInterest) {
        return { ...scored, bucket: "middle", sortScore: scored.score + MIDDLE_INTEREST_BOOST }
    }
    return { ...scored, bucket: "bottom", sortScore: scored.score }
}

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

    const picks: BucketedRecommendation[] = []
    const pickedSlugs = new Set<string>()
    const seenTypes = new Set<ActivityType>()

    // Pass 1: interest diversification — one rec per user interest, drawn from the Top bucket.
    for (const interest of interests) {
        const best = top.find((t) => t.rec.field === interest && !pickedSlugs.has(t.rec.slug))
        if (best) {
            picks.push(best)
            pickedSlugs.add(best.rec.slug)
            seenTypes.add(best.rec.type)
        }
    }

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
