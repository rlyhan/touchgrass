import { router, useLocalSearchParams, type Href } from "expo-router"
import { ArrowLeft, Lightbulb } from "lucide-react-native"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { PatternMatchAccordion } from "@/components/patterns/pattern-match-accordion"
import { RecommendationCard } from "@/components/recommendations/recommendation-card"
import { PortableText } from "@/components/ui/portable-text"
// import { PrimaryButton } from "@/components/ui/primary-button"
import { resolveDominantPattern } from "@/lib/patterns/cache"
import { usePatternWeights } from "@/lib/patterns/use-pattern-weights"
import {
  fetchActivityBySlug,
  getCachedActivity,
} from "@/lib/recommendations/api"
import { colors } from "@/lib/theme/colors"
import type { Activity } from "@touchgrass/types"
import { PATTERN_TYPES } from "@touchgrass/types/constants"

const PATTERN_BY_ID = Object.fromEntries(PATTERN_TYPES.map((p) => [p.id, p]))

function PatternMatch({ activity }: { activity: Activity }) {
  // Hook ensures pattern weights are fetched if not already cached so direct
  // entries (deep links, refresh) still resolve a dominant pattern.
  const { weights } = usePatternWeights()
  // Resolve via the shared cache: returns cached dominant for dashboard-sourced
  // activities, or computes from weights for direct entries. Threshold-gated.
  const dominantId = weights ? resolveDominantPattern(activity) : null
  const pattern = dominantId ? PATTERN_BY_ID[dominantId] : null
  if (!pattern) return null
  return (
    <View className="mt-5">
      <PatternMatchAccordion
        patternName={pattern.name}
        shortDescription={pattern.shortDescription}
      />
    </View>
  )
}

type ActivityStatus = "loading" | "ready" | "not-found" | "error"

export default function ActivityDetailPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>()

  const cached = slug ? getCachedActivity(slug) : undefined
  const [activity, setActivity] = useState<Activity | null>(cached ?? null)
  const [activityStatus, setActivityStatus] = useState<ActivityStatus>(
    slug ? (cached ? "ready" : "loading") : "not-found",
  )

  function handleBack() {
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
          <ActivityIndicator size="large" color={colors.emerald[500]} />
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
      <View className="z-10 bg-white/80 px-4 py-3" style={{ elevation: 4 }}>
        <Pressable
          onPress={handleBack}
          className="h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color={colors.gray[900]} />
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

        <PatternMatch activity={activity} />

        {activity.description && activity.description.length > 0 ? (
          <View className="mt-10">
            <Text className="mb-4 text-2xl font-semibold text-gray-900">
              About this activity
            </Text>
            <PortableText blocks={activity.description} />
          </View>
        ) : null}

        {activity.tips && activity.tips.length > 0 ? (
          <View className="mt-10 gap-3">
            {activity.tips.map((tip) => (
              <View
                key={tip.key}
                className="flex-row items-start rounded-2xl p-4"
                style={{ backgroundColor: colors.warm.bg }}
              >
                <Lightbulb size={18} color={colors.warm.accent} style={{ marginTop: 2, marginRight: 10 }} />
                <Text className="flex-1 leading-relaxed text-gray-800">
                  <Text className="font-semibold text-gray-900">Tip: </Text>
                  {tip.description}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {activity.instructions && activity.instructions.length > 0 ? (
          <View className="mt-10">
            <Text className="mb-5 text-2xl font-semibold text-gray-900">
              Instructions
            </Text>
            {activity.instructions.map((step, idx) => (
              <View
                key={`${idx}-${step.title}`}
                className="mb-5 flex-row items-start"
              >
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
                  <Text className="text-base font-semibold text-white">
                    {idx + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-xl font-semibold text-gray-900">
                    {step.title}
                  </Text>
                  {step.description ? (
                    <Text className="leading-relaxed text-gray-500">
                      {step.description}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* CTA */}
        {/* <View className="mt-8">
          <PrimaryButton label="Start this activity" onPress={() => {}} />
        </View> */}
      </ScrollView>
    </SafeAreaView>
  )
}
