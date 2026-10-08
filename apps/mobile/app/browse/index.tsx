import { LinearGradient } from "expo-linear-gradient"
import { useMemo } from "react"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "@/components/auth/auth-button"
import { ActivityList } from "@/components/recommendations/activity-list"
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
    <LinearGradient colors={["#ffffff", "#F0FDF6"]} locations={[0, 1]} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <ActivityList
          activities={activities}
          ListFooterComponent={
            <View className="mt-12 items-center">
              <AuthButton />
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  )
}
