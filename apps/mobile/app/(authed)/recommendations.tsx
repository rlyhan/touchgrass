import { router, type Href } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { GrassLogo } from "@/components/icons/grass-logo"
import { RecommendationCard } from "@/components/recommendations/recommendation-card"
import { PrimaryButton } from "@/components/ui/primary-button"
import { signOut } from "@/lib/auth/client"
import { fetchRecommendations } from "@/lib/recommendations/api"
import type { Recommendation } from "@touchgrass/types"

type Status = "loading" | "ready" | "error"

const ItemSeparator = () => <View style={{ height: 16 }} />

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [status, setStatus] = useState<Status>("loading")
  const [signingOut, setSigningOut] = useState(false)

  const load = useCallback(async () => {
    setStatus("loading")
    try {
      const recs = await fetchRecommendations()
      setRecommendations(recs)
      setStatus("ready")
    } catch {
      setStatus("error")
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSignOut = useCallback(async () => {
    setSigningOut(true)
    await signOut()
    router.replace("/sign-in" as Href)
  }, [])

  const renderItem = useCallback(
    ({ item: rec }: { item: Recommendation }) => (
      <RecommendationCard
        title={rec.title}
        imageUrl={rec.imageUrl}
        type={rec.type}
        field={rec.field}
        estimatedTime={rec.estimated_time}
      />
    ),
    [],
  )

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
              <Pressable
                onPress={handleSignOut}
                disabled={signingOut}
                className="mt-6"
                accessibilityRole="button"
                accessibilityLabel="Sign out"
              >
                <Text className="text-sm font-medium text-gray-500">
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
        keyExtractor={(rec) => rec.id}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        initialNumToRender={5}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 32, paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            <View className="items-center">
              <GrassLogo size={48} color="#10b981" />
            </View>
            <Text className="mb-6 mt-8 text-3xl font-bold tracking-tight text-gray-900">
              You might be great at...
            </Text>
          </>
        }
        ListFooterComponent={
          <View className="mt-10 items-center">
            <Pressable
              onPress={handleSignOut}
              disabled={signingOut}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <Text className="text-sm font-medium text-gray-500">
                {signingOut ? "Signing out..." : "Sign out"}
              </Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  )
}
