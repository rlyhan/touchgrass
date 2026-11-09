import { Activity, PatternTypeId } from "@touchgrass/types";
import { ACTIVITY_TYPE_PATTERNS } from "@touchgrass/types/constants";
import { calculateActivityPatternAffinity } from "./patterns.js";

const SECONDARY_WEIGHT = 0.2

/*
 * Calculates the base score for a recommendation based on pattern affinity.
 * Primary affinity is the anchor; secondary affinity adds a small bonus on top
 * so a strong primary match isn't dragged down by a weaker secondary match.
 *
 * eg. "Spend a Month Visiting Antique Markets" -> type: Exploratory, related_types: Social, Reflective
 * User's match with primary patterns = 0.63, secondary patterns = 0.59
 * Base score = 0.63 + (0.59 * 0.2) = 0.748
 */
export function calculateRecommendationBaseScore(
    userPatternWeights: Record<PatternTypeId, number>,
    recommendation: Activity,
): number {
    const primaryPatterns = ACTIVITY_TYPE_PATTERNS[recommendation.type] ?? []
    const primaryAffinity = calculateActivityPatternAffinity(userPatternWeights, primaryPatterns)

    const secondaryPatterns = (recommendation.related_types ?? []).flatMap(
        (t) => ACTIVITY_TYPE_PATTERNS[t] ?? []
    )
    if (secondaryPatterns.length === 0) return primaryAffinity

    const secondaryAffinity = calculateActivityPatternAffinity(userPatternWeights, secondaryPatterns)
    return primaryAffinity + secondaryAffinity * SECONDARY_WEIGHT
}
