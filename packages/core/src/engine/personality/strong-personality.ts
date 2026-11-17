import { PatternTypeId } from "@touchgrass/types"

/*
 * Strong personality: the activity passes both personality checks, so its page can say "You scored highly as …".
 * 1. Top personality fit — its base score (how well its patterns as a whole fit the user) is over one SD above their average,
 *    which keeps roughly the top sixth of the catalogue. See getHighBaseScoreActivities.
 * 2. High-scoring pattern — the user has a strong trait connected to it: a dominant pattern of at least MIN_DOMINANT_WEIGHT
 *    (0.6). Most activities pass this for a user with a few strong traits, so on its own it doesn't single any out.
 * Each catches what the other misses: middling users pass check 1 with nothing high, and users with a few strong traits pass
 * check 2 on nearly every activity. Together they keep "You scored highly as …" true.
 */
export function isStrongPersonality(isTopPersonalityFit: boolean, dominantPatternId: PatternTypeId | null): boolean {
    return isTopPersonalityFit && dominantPatternId !== null
}
