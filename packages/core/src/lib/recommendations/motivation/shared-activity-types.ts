import type { Activity, Motivation, SharedActivityTypesByMotivation } from "@touchgrass/types"

/*
 * Shared activity types by motivation: for each of the user's motivations, the activity types it has in common with this
 * activity (its primary type plus related types). Motivations sharing none are left out, so the number of keys is how many
 * motivations overlap the activity.
 */
export function getSharedActivityTypesBetweenActivityAndUserMotivations(activity: Activity, userMotivations: Motivation[]): SharedActivityTypesByMotivation {
    const activityTypes = [activity.type, ...(activity.related_types ?? [])]
    const sharedActivityTypesByMotivation: SharedActivityTypesByMotivation = {}
    userMotivations.forEach((m) => {
        const sharedActivityTypes = m.associated_activity_types.filter((t) => activityTypes.includes(t))
        if (sharedActivityTypes.length > 0) sharedActivityTypesByMotivation[m.value] = sharedActivityTypes
    })
    return sharedActivityTypesByMotivation
}
