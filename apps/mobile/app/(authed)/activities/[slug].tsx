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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

import { ActivityCard } from "@/components/activities/activity-card"
import { MatchReasons } from "@/components/activities/match-reasons"
import { PortableText } from "@/components/ui/portable-text"
// import { PrimaryButton } from "@/components/ui/primary-button"
import { UnauthenticatedError } from "@/lib/auth/errors"
import {
  fetchActivityBySlug,
  getCachedActivity,
} from "@/lib/recommendations/api"
import { useInterests, useMatchLabels } from "@/lib/recommendations/recommendation-store"
import { useLoadRecommendationsIfMissing } from "@/lib/recommendations/use-load-recommendations-if-missing"
import { colors } from "@/lib/theme/colors"
import type { Activity } from "@touchgrass/types"

type ActivityStatus = "loading" | "ready" | "not-found" | "error"

const PAGE_PADDING = 16

// Activity slugs are CMS-driven, so we don't enumerate them at build time.
// Static export only emits HTML for routes it knows about, so a dynamic route
// with no params produces no file and direct hits / hard refreshes 404 at the
// host. We emit a single placeholder "shell" page instead; Vercel rewrites
// every /activities/* request to it (see vercel.json), and the component below
// reads the real slug from the URL on the client and fetches the activity.
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return [{ slug: "_shell" }]
}

export default function ActivityDetailPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const matchLabel = useMatchLabels()[slug ?? ""]
  // The label's reasons: its pattern (strong personality matches only) and, per shared motivation, the types it shares.
  const reasonPatternId = matchLabel?.patternId
  const sharedActivityTypesByMotivation = matchLabel?.sharedActivityTypesByMotivation
  const interests = useInterests()
  const { bottom: bottomInset } = useSafeAreaInsets()
  useLoadRecommendationsIfMissing()

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
      .catch((err) => {
        if (cancelled) return
        if (err instanceof UnauthenticatedError) {
          router.replace("/sign-in" as Href)
          return
        }
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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header with back button */}
      <View
        className="z-10 bg-white/80 px-4 py-3"
        style={{
          elevation: 4,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        }}
      >
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
        contentContainerStyle={{ paddingHorizontal: PAGE_PADDING, paddingBottom: 32 + bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <ActivityCard
          title={activity.title}
          imageUrl={activity.imageUrl}
          type={activity.type}
          field={activity.field}
          estimatedTime={activity.estimated_time}
          size="large"
        />

        <MatchReasons
          patternId={reasonPatternId}
          sharedActivityTypesByMotivation={sharedActivityTypesByMotivation}
          varietyType={matchLabel?.pickedForVariety ? activity.type : undefined}
          interestField={interests.includes(activity.field) ? activity.field : undefined}
        />

        {activity.description && activity.description.length > 0 ? (
          <View
            className="mt-10 bg-emerald-50 pb-4 pt-8"
            style={{ marginHorizontal: -PAGE_PADDING, paddingHorizontal: PAGE_PADDING }}
          >
            <Text className="mb-4 text-2xl font-semibold text-gray-900">
              About this activity
            </Text>
            <PortableText
              blocks={activity.description}
              paragraphClassName="mb-4 leading-relaxed text-gray-700"
            />
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
            {activity.instructions.map((step, idx, steps) => {
              const isFirst = idx === 0
              const isLast = idx === steps.length - 1
              return (
                <View key={`${idx}-${step.title}`} className="flex-row">
                  <View className="mr-3 items-center">
                    <View className={`h-2 w-0.5 ${isFirst ? "" : "bg-emerald-200"}`} />
                    <View className="h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-500 bg-white">
                      <Text className="text-base font-semibold text-emerald-600">
                        {idx + 1}
                      </Text>
                    </View>
                    {isLast ? null : (
                      <View testID="instruction-trail" className="w-0.5 flex-1 bg-emerald-200" />
                    )}
                  </View>
                  <View className={`flex-1 ${isLast ? "" : "pb-4"}`}>
                    <View className="rounded-2xl bg-gray-100 px-4 pb-4 pt-3">
                      <Text className="text-base font-semibold leading-6 text-gray-900">
                        {step.title}
                      </Text>
                      {step.description ? (
                        <Text className="mt-1.5 text-sm leading-relaxed text-gray-700">
                          {step.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              )
            })}
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
