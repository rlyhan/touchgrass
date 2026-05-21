import type { LoadRecommendations } from "./source.js"

// TODO: Replace with a real Sanity query as activities are migrated.
// Recommendations returned here win over any mock with the same slug.
export const fetchActivitiesFromSanity: LoadRecommendations = async () => []
