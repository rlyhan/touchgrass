import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations";
import { ActivityType, BFASScores, Recommendation } from "@touchgrass/types";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_BFAS_MAPPING } from "@touchgrass/types/constants";

/* Recommendation Algorithm */

function calculateAlignment(
    activityType: ActivityType,
    userTraits: BFASScores
): number {
    const activityTraits = ACTIVITY_TYPE_BFAS_MAPPING[activityType]

    let totalDiff = 0
    let maxDiff = 0

    for (const key in userTraits) {
        const userValue = userTraits[key as keyof BFASScores] ?? 0
        const activityValue = activityTraits[key as keyof BFASScores] ?? 0

        const diff = Math.abs(userValue - activityValue)

        totalDiff += diff
        maxDiff += 100 // max possible per trait
    }

    const score = 1 - totalDiff / maxDiff

    return score
}

function getUserAlignments(userTraits: BFASScores): Record<ActivityType, number> {
    const alignments: Record<ActivityType, number> = {} as Record<ActivityType, number>
    ACTIVITY_TYPES.forEach(activityType => {
        alignments[activityType] = calculateAlignment(activityType, userTraits)
    })
    return alignments
}

const PRIMARY_ALIGNMENT_MIN = 0.8
const SECONDARY_ALIGNMENT_MIN = 0.6

export type ScoredRecommendation = { rec: Recommendation; score: number }

export function getRecommendations(userTraits: BFASScores): ScoredRecommendation[] {
    const scored: ScoredRecommendation[] = []

    const userAlignments = getUserAlignments(userTraits)

    for (const recommendation of RECOMMENDATIONS) {
        const baseScore = calculateAlignment(recommendation.type, userTraits)

        const primaryAlignment = userAlignments[recommendation.type]

        let primaryBoost = 0
        if (primaryAlignment >= PRIMARY_ALIGNMENT_MIN) {
            primaryBoost = 0.15
        }

        let secondaryBoost = 0
        for (const type of recommendation.related_types ?? []) {
            const alignment = userAlignments[type]

            if (alignment >= SECONDARY_ALIGNMENT_MIN) {
                secondaryBoost += 0.05 * alignment
            }
        }

        const finalScore = baseScore + primaryBoost + secondaryBoost

        scored.push({ rec: recommendation, score: finalScore })
    }

    // Sort highest → lowest
    scored.sort((a, b) => b.score - a.score)

    // Return top 3
    return scored.slice(0, 3)
}