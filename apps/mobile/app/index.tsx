import { Redirect, type Href } from "expo-router"
import { ActivityIndicator, View } from "react-native"

import { useSession } from "@/lib/auth/client"

export default function Index() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#10b981" />
      </View>
    )
  }

  return (
    <Redirect
      href={(session?.user ? "/recommendations" : "/onboarding/name") as Href}
    />
  )
}
