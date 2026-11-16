import { ActivityField, ScoredRecommendation } from "@touchgrass/types"

type RecBucket = "top" | "middle" | "bottom"

export type BucketedRecommendation = ScoredRecommendation & {
    bucket: RecBucket
    sortScore: number
}

export const TOP_BUCKET_MIN_SCORE = 0.6
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
