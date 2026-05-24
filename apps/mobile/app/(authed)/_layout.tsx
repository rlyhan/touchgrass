import { Redirect, Stack, type Href } from "expo-router"
import { ActivityIndicator, View } from "react-native"

import { useSession } from "@/lib/auth/client"
import { colors } from "@/lib/theme/colors"

export default function AuthedLayout() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={colors.emerald[500]} />
      </View>
    )
  }

  if (!session?.user) {
    return <Redirect href={"/onboarding/name" as Href} />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
