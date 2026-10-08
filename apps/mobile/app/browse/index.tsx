import { useMemo, useState } from "react"
import { Text, TextInput } from "react-native"

import { ActivityListScreen } from "@/components/recommendations/activity-list-screen"
import { colors } from "@/lib/theme/colors"
import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { Activity } from "@touchgrass/types"

const RANDOM_ACTIVITY_COUNT = 10

function generateRandomActivities(): Activity[] {
  const randomActivities = new Set<Activity>()
  while (randomActivities.size < Math.min(RANDOM_ACTIVITY_COUNT, RECOMMENDATIONS.length)) {
    randomActivities.add(RECOMMENDATIONS[Math.floor(Math.random() * RECOMMENDATIONS.length)])
  }
  return Array.from(randomActivities)
}

function matchesQuery(activity: Activity, query: string): boolean {
  return [activity.title, activity.field, activity.type].some((value) =>
    value.toLowerCase().includes(query),
  )
}

export default function BrowsePage() {
  const randomActivities = useMemo(generateRandomActivities, [])
  const [query, setQuery] = useState("")

  const activities = useMemo(() => {
    const normalised = query.trim().toLowerCase()
    if (!normalised) return randomActivities
    return RECOMMENDATIONS.filter((activity) => matchesQuery(activity, normalised))
  }, [query, randomActivities])

  return (
    <ActivityListScreen
      activities={activities}
      header={
        <>
          <Text className="mt-10 text-3xl font-bold tracking-tight text-gray-900">
            Browse activities
          </Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search activities"
            placeholderTextColor={colors.gray[400]}
            accessibilityLabel="Search activities"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            className="mb-8 mt-4 h-12 rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900"
          />
        </>
      }
    />
  )
}
