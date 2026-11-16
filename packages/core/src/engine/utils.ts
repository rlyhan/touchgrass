import { Activity } from "@touchgrass/types"

/* The mean of the given scores, and their (population) standard deviation: how spread out they are around it. */
export function getMeanAndSd(scores: number[]): { mean: number; sd: number } {
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const sd = Math.sqrt(scores.reduce((sum, score) => sum + (score - mean) ** 2, 0) / scores.length)
    return { mean, sd }
}

/* The slugs of the given activities, as a set for quick lookups. */
export function getSlugSet(activities: Activity[]): Set<string> {
    return new Set(activities.map((rec) => rec.slug))
}
