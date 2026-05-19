import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { router, useLocalSearchParams } from "expo-router"
import { ArrowLeft, Clock, Sparkle } from "lucide-react-native"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { getActivityTypeIcon, getFieldIcon } from "@/lib/icons"
import {
  type ActivityDetailExtended,
  fetchRecommendationDetail,
  getCachedActivity,
} from "@/lib/recommendations/api"
import type { Activity } from "@touchgrass/types"

export default function RecommendationDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  // Resolved immediately from cache — no loading state needed for base fields
  const activity: Activity | undefined = id ? getCachedActivity(id) : undefined

  const [extended, setExtended] = useState<ActivityDetailExtended | null>(null)
  const [extendedError, setExtendedError] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchRecommendationDetail(id)
      .then(setExtended)
      .catch(() => setExtendedError(true))
  }, [id])

  if (!activity) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500">Activity not found.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const TypeIcon = getActivityTypeIcon(activity.type)
  const FieldIcon = getFieldIcon(activity.field)

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
        {/* Hero image with gradient + title overlay — renders instantly from cache */}
        <View className="overflow-hidden rounded-t-2xl">
          <View style={{ aspectRatio: 4 / 3 }}>
            <Image
              source={{ uri: activity.imageUrl }}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.7)"]}
              locations={[0, 0.5, 1]}
              style={{ position: "absolute", inset: 0 }}
            />
            <View className="absolute bottom-0 left-0 right-0 p-5">
              <Text className="text-2xl font-bold leading-tight text-white">
                {activity.title}
              </Text>
            </View>
          </View>
        </View>

        {/* Metadata card — renders instantly from cache */}
        <View className="rounded-b-2xl border border-t-0 border-gray-200 bg-white">
          <View className="flex-row items-center gap-6 px-5 py-4">
            <View className="flex-row items-center gap-2">
              <TypeIcon size={16} color="#6b7280" />
              <Text className="text-sm text-gray-500">{activity.type}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <FieldIcon size={16} color="#6b7280" />
              <Text className="text-sm text-gray-500">{activity.field}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Clock size={16} color="#6b7280" />
              <Text className="text-sm text-gray-500">
                {activity.estimated_time}
              </Text>
            </View>
          </View>
        </View>

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
        <Pressable className="mt-8 w-full rounded-2xl bg-emerald-500 py-4">
          <Text className="text-center text-base font-semibold text-white">
            Start this activity
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
