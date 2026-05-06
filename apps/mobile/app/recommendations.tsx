import { useLocalSearchParams } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { GrassLogo } from "@/components/icons/grass-logo"
import { RecommendationCard } from "@/components/recommendations/recommendation-card"
import { PrimaryButton } from "@/components/ui/primary-button"
import { fetchRecommendations } from "@/lib/recommendations/api"
import type { Recommendation } from "@touchgrass/types"

type Status = "loading" | "ready" | "error"

export default function RecommendationsPage() {
  const { userId } = useLocalSearchParams<{ userId?: string }>()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [status, setStatus] = useState<Status>("loading")

  const load = useCallback(async () => {
    if (typeof userId !== "string") {
      setStatus("error")
      return
    }
    setStatus("loading")
    try {
      const recs = await fetchRecommendations(userId)
      setRecommendations(recs)
      setStatus("ready")
    } catch {
      setStatus("error")
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  if (status !== "ready") {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center px-8">
          <GrassLogo size={48} color="#10b981" />
          {status === "loading" ? (
            <ActivityIndicator
              size="large"
              color="#10b981"
              className="mt-10"
            />
          ) : (
            <>
              <Text className="mt-10 text-center text-xl font-semibold text-gray-900">
                Couldn&apos;t load your recommendations.
              </Text>
              <View className="mt-8 w-full">
                <PrimaryButton label="Try again" onPress={load} />
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 py-8">
        <View className="items-center">
          <GrassLogo size={48} color="#10b981" />
        </View>

        <Text className="mt-8 text-3xl font-bold tracking-tight text-gray-900">
          You might be great at...
        </Text>

        <View className="mt-6 flex-col gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              title={rec.title}
              imageUrl={rec.imageUrl}
              type={rec.type}
              field={rec.field}
              estimatedTime={rec.estimated_time}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
