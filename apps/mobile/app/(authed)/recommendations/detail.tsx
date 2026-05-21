import { router, useLocalSearchParams } from "expo-router"
import { ArrowLeft, Sparkle } from "lucide-react-native"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { RecommendationCard } from "@/components/recommendations/recommendation-card"
import { PrimaryButton } from "@/components/ui/primary-button"
import {
  type ActivityDetailExtended,
  fetchRecommendationDetail,
  getCachedActivity,
} from "@/lib/recommendations/api"
import type { Activity } from "@touchgrass/types"

export default function RecommendationDetailPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>()

  // Resolved immediately from cache — no loading state needed for base fields
  const activity: Activity | undefined = slug ? getCachedActivity(slug) : undefined

  const [extended, setExtended] = useState<ActivityDetailExtended | null>(null)
  const [extendedError, setExtendedError] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetchRecommendationDetail(slug)
      .then(setExtended)
      .catch(() => setExtendedError(true))
  }, [slug])

  if (!activity) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500">Activity not found.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Header with back button */}
      <View className="z-10 bg-white/80 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color="#111827" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <RecommendationCard
          title={activity.title}
          imageUrl={activity.imageUrl}
          type={activity.type}
          field={activity.field}
          estimatedTime={activity.estimated_time}
          size="large"
        />

        {/* AI summary + description — loaded async from /recommendations/:id/detail */}
        {extendedError ? null : !extended ? (
          <View className="mt-6 items-center py-8">
            <ActivityIndicator size="small" color="#10b981" />
          </View>
        ) : (
          <>
            <View className="mt-6 rounded-2xl bg-emerald-50 p-5">
              <View className="flex-row items-start gap-3">
                <View className="h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Sparkle size={16} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-sm font-semibold text-gray-900">
                    Summary
                  </Text>
                  <Text className="text-sm leading-relaxed text-gray-500">
                    {extended.aiSummary}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-6">
              <Text className="mb-3 text-lg font-semibold text-gray-900">
                About this activity
              </Text>
              {extended.description.split("\n\n").map((paragraph, index) => (
                <Text
                  key={index}
                  className="mb-4 leading-relaxed text-gray-500"
                >
                  {paragraph}
                </Text>
              ))}
            </View>
          </>
        )}

        {/* CTA */}
        <View className="mt-8">
          <PrimaryButton label="Start this activity" onPress={() => {}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
