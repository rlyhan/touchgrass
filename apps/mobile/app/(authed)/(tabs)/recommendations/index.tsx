import { router, type Href } from "expo-router"
import { useCallback, useMemo } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { GrassLogo } from "@/components/icons/grass-logo"
import { TopPatternsSection } from "@/components/patterns/top-patterns-section"
import { ActivityListScreen } from "@/components/activities/activity-list-screen"
import { PrimaryButton } from "@/components/ui/primary-button"
import { ONBOARDING_ROUTES } from "@/lib/onboarding/routes"
import { getCachedPatternWeights } from "@/lib/patterns/cache"
import {
  fetchRecommendations,
  ProfileNotFoundError,
  UnauthenticatedError,
} from "@/lib/recommendations/api"
import { colors } from "@/lib/theme/colors"
import { useAsyncData } from "@/lib/use-async-data"
import type { RecommendedActivity } from "@touchgrass/types"

export default function RecommendationsPage() {
  const fetcher = useCallback(async (): Promise<RecommendedActivity[]> => {
    try {
      return await fetchRecommendations()
    } catch (err) {
      if (err instanceof UnauthenticatedError) {
        router.replace("/sign-in" as Href)
        return []
      }
      // The user is authenticated but has no profile — most likely because
      // onboarding was interrupted before profile creation completed. Send
      // them back to finish it rather than leaving them on a dead-end error.
      if (err instanceof ProfileNotFoundError) {
        router.replace(ONBOARDING_ROUTES.basicDetails as Href)
        return []
      }
      throw err
    }
  }, [])

  const { data: recommendations = [], status, reload } = useAsyncData(fetcher)
  const patternWeights = getCachedPatternWeights()

  const listHeader = useMemo(
    () => (
      <>
        {patternWeights ? (
          <View className="mt-10">
            <TopPatternsSection patternWeights={patternWeights} />
          </View>
        ) : null}
        <Text className="mb-8 mt-4 text-3xl font-bold tracking-tight text-gray-900">
          Your recommendations
        </Text>
      </>
    ),
    [patternWeights],
  )

  if (status !== "ready") {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-8">
          <GrassLogo />
          {status === "loading" ? (
            <ActivityIndicator
              size="large"
              color={colors.warm.spinner}
              className="mt-10"
            />
          ) : (
            <>
              <Text className="mt-10 text-center text-xl font-semibold text-gray-900">
                Couldn&apos;t load your recommendations.
              </Text>
              <View className="mt-8 w-full">
                <PrimaryButton label="Try again" onPress={reload} />
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    )
  }

  return (
    <ActivityListScreen
      activities={recommendations}
      header={listHeader}
      footer={
        <PrimaryButton
          label="Browse more activities"
          onPress={() => router.push("/browse" as Href)}
        />
      }
    />
  )
}
