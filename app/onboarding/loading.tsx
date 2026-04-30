import { router, type Href } from "expo-router"
import { useEffect } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { GrassLogo } from "@/components/icons/grass-logo"

const LOADING_DELAY_MS = 2000

export default function OnboardingLoadingScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/recommendations" as Href)
    }, LOADING_DELAY_MS)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 items-center justify-center px-8">
        <GrassLogo size={48} color="#10b981" />
        <ActivityIndicator
          size="large"
          color="#10b981"
          className="mt-10"
        />
        <Text className="mt-8 text-center text-xl font-semibold text-gray-900">
          Let&apos;s see what your next thing could be!
        </Text>
      </View>
    </SafeAreaView>
  )
}
