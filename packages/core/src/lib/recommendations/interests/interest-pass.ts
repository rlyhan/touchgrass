import { ActivityField } from "@touchgrass/types"
import { BucketedRecommendation } from "./buckets.js"

/*
 * Picks the best Top-bucket rec for each user interest, in the order the interests were given.
 * Expects `top` sorted by `sortScore` descending. Interests with no Top-bucket match are skipped,
 * and two picks may share an activity type.
 */
export function pickOnePerInterest(
    top: BucketedRecommendation[],
    interests: ActivityField[],
): BucketedRecommendation[] {
    const picks: BucketedRecommendation[] = []
    const pickedSlugs = new Set<string>()

    for (const interest of interests) {
        const best = top.find((t) => t.rec.field === interest && !pickedSlugs.has(t.rec.slug))
        if (best) {
            picks.push(best)
            pickedSlugs.add(best.rec.slug)
        }
    }

    return picks
}
