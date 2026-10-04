import { Redirect, Stack, type Href } from "expo-router"
import { useCallback, useState } from "react"
import { ActivityIndicator, View } from "react-native"

import { useSession } from "@/lib/auth/client"
import { fetchHasProfile } from "@/lib/onboarding/api"
import { OnboardingProvider } from "@/lib/onboarding/context"
import {
  PROTECTED_ONBOARDING_SCREENS,
  PUBLIC_ONBOARDING_SCREENS,
} from "@/lib/onboarding/routes"
import { colors } from "@/lib/theme/colors"
import { useAsyncData } from "@/lib/use-async-data"

// Signed-out visitors only reach the name step (Stack.Protected falls back to it);
// signed-in users with a profile go to recommendations. Signed-in users without
// one stay, so interrupted onboarding can be finished.
export default function OnboardingLayout() {
  const { data: session, isPending } = useSession()
  const userId = session?.user?.id ?? null

  const checkProfile = useCallback(
    async () => (userId ? fetchHasProfile() : false),
    [userId],
  )
  const { data: hasProfile, status: profileStatus } = useAsyncData(checkProfile)

  // Only the first check blocks rendering, so sign-up isn't interrupted by a spinner.
  const checking = isPending || profileStatus === "loading"
  const [settled, setSettled] = useState(false)
  if (!settled && !checking) setSettled(true)

  if (hasProfile === true) {
    return <Redirect href={"/recommendations" as Href} />
  }

  if (!settled && checking) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={colors.emerald[500]} />
      </View>
    )
  }

  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "white" },
        }}
      >
        {PUBLIC_ONBOARDING_SCREENS.map((name) => (
          <Stack.Screen key={name} name={name} />
        ))}
        <Stack.Protected guard={userId !== null}>
          {PROTECTED_ONBOARDING_SCREENS.map((name) => (
            <Stack.Screen key={name} name={name} />
          ))}
        </Stack.Protected>
      </Stack>
    </OnboardingProvider>
  )
}
