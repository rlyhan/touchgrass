import { router, type Href } from "expo-router"
import { useCallback, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { GrassLogo } from "@/components/icons/grass-logo"
import { TopPatternsSection } from "@/components/patterns/top-patterns-section"
import { RecommendationCard } from "@/components/recommendations/recommendation-card"
import { PrimaryButton } from "@/components/ui/primary-button"
import { signOut } from "@/lib/auth/client"
import {
  clearPatternWeightsCache,
  getCachedPatternWeights,
} from "@/lib/patterns/cache"
import {
  fetchRecommendations,
  ProfileNotFoundError,
} from "@/lib/recommendations/api"
import { colors } from "@/lib/theme/colors"
import { useAsyncData } from "@/lib/use-async-data"
import type { Activity } from "@touchgrass/types"

const ItemSeparator = () => <View style={{ height: 16 }} />

export default function RecommendationsPage() {
  const [signingOut, setSigningOut] = useState(false)

  const fetcher = useCallback(async (): Promise<Activity[]> => {
    try {
      return await fetchRecommendations()
    } catch (err) {
      // The user is authenticated but has no profile — most likely because
      // onboarding was interrupted before profile creation completed. Send
      // them back to finish it rather than leaving them on a dead-end error.
      if (err instanceof ProfileNotFoundError) {
        router.replace("/onboarding/basic-details" as Href)
        return []
      }
      throw err
    }
  }, [])

  const { data: recommendations = [], status, reload } = useAsyncData(fetcher)

  const handleSignOut = useCallback(async () => {
    setSigningOut(true)
    await signOut()
    // Drop cached pattern weights so the next user doesn't inherit them.
    clearPatternWeightsCache()
    router.replace("/sign-in" as Href)
  }, [])

  const renderItem = useCallback(
    ({ item: rec }: { item: Activity }) => (
      <Pressable
        onPress={() =>
          router.push(`/activities/${rec.slug}` as Href)
        }
        accessibilityRole="button"
        accessibilityLabel={`View details for ${rec.title}`}
      >
        <RecommendationCard
          title={rec.title}
          imageUrl={rec.imageUrl}
          type={rec.type}
          field={rec.field}
          estimatedTime={rec.estimated_time}
        />
      </Pressable>
    ),
    [],
  )

  if (status !== "ready") {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
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
              <Pressable
                onPress={handleSignOut}
                disabled={signingOut}
                className="mt-6 rounded-full border border-gray-300 px-5 py-2"
                accessibilityRole="button"
                accessibilityLabel="Sign out"
              >
                <Text className="text-sm font-medium text-gray-700">
                  {signingOut ? "Signing out..." : "Sign out"}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <FlatList
        data={recommendations}
        keyExtractor={(rec) => rec.slug}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        initialNumToRender={5}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            <View className="items-center">
              <GrassLogo />
            </View>
            {(() => {
              const weights = getCachedPatternWeights()
              return weights ? (
                <View className="mt-10">
                  <TopPatternsSection patternWeights={weights} />
                </View>
              ) : null
            })()}
            <Text className="mb-8 mt-4 text-3xl font-bold tracking-tight text-gray-900">
              Your recommendations
            </Text>
          </>
        }
        ListFooterComponent={
          <View className="mt-12 items-center">
            <Pressable
              onPress={handleSignOut}
              disabled={signingOut}
              className="rounded-full border border-gray-300 px-5 py-2"
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <Text className="text-sm font-medium text-gray-700">
                {signingOut ? "Signing out..." : "Sign out"}
              </Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  )
}
