import { router, useLocalSearchParams, type Href } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
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
import { PortableText } from "@/components/ui/portable-text"
import { PrimaryButton } from "@/components/ui/primary-button"
import {
  fetchActivityBySlug,
  getCachedActivity,
} from "@/lib/recommendations/api"
import type { Activity } from "@touchgrass/types"

type ActivityStatus = "loading" | "ready" | "not-found" | "error"

export default function ActivityDetailPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>()

  const cached = slug ? getCachedActivity(slug) : undefined
  const [activity, setActivity] = useState<Activity | null>(cached ?? null)
  const [activityStatus, setActivityStatus] = useState<ActivityStatus>(
    slug ? (cached ? "ready" : "loading") : "not-found",
  )

  const handleBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace("/recommendations" as Href)
  }

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    fetchActivityBySlug(slug)
      .then((a) => {
        if (cancelled) return
        if (a) {
          setActivity(a)
          setActivityStatus("ready")
        } else {
          // Server has no such activity. If we were showing a cached copy,
          // keep it; otherwise mark not-found.
          setActivityStatus((prev) => (prev === "ready" ? prev : "not-found"))
        }
      })
      .catch(() => {
        if (cancelled) return
        // Network error: keep showing cached copy if we had one.
        setActivityStatus((prev) => (prev === "ready" ? prev : "error"))
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (activityStatus === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </SafeAreaView>
    )
  }

  if (activityStatus !== "ready" || !activity) {
    const message =
      activityStatus === "error"
        ? "Couldn't load activity."
        : "Activity not found."
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500">{message}</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Header with back button */}
      <View className="z-10 bg-white/80 px-4 py-3">
        <Pressable
          onPress={handleBack}
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

        {activity.description && activity.description.length > 0 ? (
          <View className="mt-6">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              About this activity
            </Text>
            <PortableText blocks={activity.description} />
          </View>
        ) : null}

        {/* CTA */}
        <View className="mt-8">
          <PrimaryButton label="Start this activity" onPress={() => {}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
