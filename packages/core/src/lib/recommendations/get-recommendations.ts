import { Activity, ActivityField, BFASScores, MatchLabel, Motivation, ScoredRecommendation } from "@touchgrass/types";
import { diversifyAndOrder } from "./diversify.js";
import { getMatchLabels } from "./match-labels.js";
import { getOCEANScores } from "./personality/ocean.js";
import { getUserPatternWeights } from "./personality/patterns.js";
import { getHighFinalScoreActivities, getSlugSet, scoreRecommendation } from "./score.js";

const MAX_RECOMMENDATIONS = 10

/*
 * Returns scored, diversified recommendations for a user.
 * Converts BFAS traits → OCEAN → NEO pattern weights, scores each recommendation
 * (including motivation boost), then applies interest-aware diversification and bucket
 * ordering before capping the result. Also returns the high scoring slugs (every activity
 * scoring at least half a standard deviation above the user's mean score) and the match label
 * browse shows for each activity.
 */
export function getRecommendations(
    userTraits: BFASScores,
    motivations: Motivation[],
    interests: ActivityField[],
    activities: Activity[],
): { recommendations: ScoredRecommendation[]; recommendedSlugs: string[]; matchLabels: Record<string, MatchLabel> } {
    // Get the user's alignment to each NEO pattern from their BFAS scores.
    const bfasToOCEAN = getOCEANScores(userTraits)
    const userPatternWeights = getUserPatternWeights(bfasToOCEAN)

    // Score every activity (personality + motivation), then take the top MAX_RECOMMENDATIONS for the recommendations screen.
    const scoredRecommendations = activities.map((rec) => scoreRecommendation(userPatternWeights, rec, motivations))
    const recommendations = diversifyAndOrder(scoredRecommendations, interests).slice(0, MAX_RECOMMENDATIONS)

    // Find the high scoring activities, then give each activity the match label browse shows, with the reasons behind it.
    const highScoringSlugSet = getSlugSet(getHighFinalScoreActivities(scoredRecommendations))
    const recommendedSlugSet = getSlugSet(recommendations.map((s) => s.rec))
    const varietyPickSlugSet = getSlugSet(recommendations.filter((s) => s.pickedForVariety).map((s) => s.rec))
    const matchLabels = getMatchLabels(activities, motivations, userPatternWeights, recommendedSlugSet, varietyPickSlugSet)

    // Return the recommendations screen's activities, the high scoring slugs, and each activity's match label.
    return {
        recommendations,
        recommendedSlugs: [...highScoringSlugSet],
        matchLabels,
    }
}
