import { useMemo } from "react"
import { Text } from "react-native"

import { ActivityListScreen } from "@/components/recommendations/activity-list-screen"
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

export default function BrowsePage() {
  const activities = useMemo(generateRandomActivities, [])

  return (
    <ActivityListScreen
      activities={activities}
      header={
        <Text className="mb-8 mt-10 text-3xl font-bold tracking-tight text-gray-900">
          Browse activities
        </Text>
      }
    />
  )
}
