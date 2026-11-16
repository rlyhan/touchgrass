import { Activity, ActivityField, BFASScores, MatchLabel, Motivation, ScoredRecommendation } from "@touchgrass/types";
import { diversifyAndOrder } from "./diversify.js";
import { getMatchLabels } from "./match-labels.js";
import { getOCEANScores } from "./personality/ocean.js";
import { getUserPatternWeights } from "./personality/patterns.js";
import { getSlugSet, scoreRecommendation } from "./score.js";

const MAX_RECOMMENDATIONS = 10

/*
 * Returns scored, diversified recommendations for a user.
 * Converts BFAS traits → OCEAN → NEO pattern weights, scores each recommendation
 * (including motivation boost), then applies interest-aware diversification and bucket
 * ordering before capping the result. Also returns the match label browse shows for each activity.
 */
export function getRecommendations(
    userTraits: BFASScores,
    motivations: Motivation[],
    interests: ActivityField[],
    activities: Activity[],
): { recommendations: ScoredRecommendation[]; matchLabels: Record<string, MatchLabel> } {
    // Get the user's alignment to each NEO pattern from their BFAS scores.
    const bfasToOCEAN = getOCEANScores(userTraits)
    const userPatternWeights = getUserPatternWeights(bfasToOCEAN)

    // Score every activity (personality + motivation), then take the top MAX_RECOMMENDATIONS for the recommendations screen.
    const scoredRecommendations = activities.map((rec) => scoreRecommendation(userPatternWeights, rec, motivations))
    const recommendations = diversifyAndOrder(scoredRecommendations, interests).slice(0, MAX_RECOMMENDATIONS)

    // Give each activity the match label browse shows, with the reasons behind it.
    const recommendedSlugSet = getSlugSet(recommendations.map((s) => s.rec))
    const varietyPickSlugSet = getSlugSet(recommendations.filter((s) => s.pickedForVariety).map((s) => s.rec))
    const matchLabels = getMatchLabels(activities, motivations, userPatternWeights, recommendedSlugSet, varietyPickSlugSet)

    // Return the recommendations screen's activities and each activity's match label.
    return { recommendations, matchLabels }
}
