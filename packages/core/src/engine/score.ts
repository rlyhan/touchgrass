import { Activity, Motivation, PatternTypeId, ScoredRecommendation } from "@touchgrass/types";
import { calculateMotivationBoost } from "./motivation/boost.js";
import { calculateRecommendationBaseScore } from "./personality/base-score.js";

/* Combines base pattern affinity with motivation boost to produce a final score. */
export function scoreRecommendation(userPatternWeights: Record<PatternTypeId, number>, recommendation: Activity, motivations: Motivation[]): ScoredRecommendation {
    const baseScore = calculateRecommendationBaseScore(userPatternWeights, recommendation)
    const motivationBoost = calculateMotivationBoost(userPatternWeights, recommendation, motivations)
    return { rec: recommendation, score: baseScore + motivationBoost }
}
