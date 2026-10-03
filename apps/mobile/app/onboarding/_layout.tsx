import { Redirect, Stack, usePathname, type Href } from "expo-router"
import { useCallback, useState, useSyncExternalStore } from "react"
import { ActivityIndicator, Platform, View } from "react-native"

import { useSession } from "@/lib/auth/client"
import { getStoredToken } from "@/lib/auth/token-store"
import { fetchHasProfile } from "@/lib/onboarding/api"
import { OnboardingProvider } from "@/lib/onboarding/context"
import { onboardingRouteRequiresAuth } from "@/lib/onboarding/routes"
import { colors } from "@/lib/theme/colors"
import { useAsyncData } from "@/lib/use-async-data"

const noopSubscribe = () => () => {}

// On web the bearer token lives in localStorage, which we can read without
// waiting on a session round-trip. The server snapshot is null ("unknown") so
// statically rendered HTML hydrates cleanly before the real value is read.
function useHasStoredToken(): boolean | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => getStoredToken() !== null,
    () => null,
  )
}

// Keeps people out of onboarding steps that don't apply to them:
// - signed out on a post-sign-up step (e.g. a pasted /onboarding/basic-details
//   URL) → home. Native stores its token in SecureStore, so it uses the
//   session hook instead of the web token check.
// - signed in with a profile already created → recommendations.
// Signed-in users *without* a profile stay put: that's how the recommendations
// screen sends people back to finish an interrupted onboarding.
export default function OnboardingLayout() {
  const pathname = usePathname()
  const { data: session, isPending } = useSession()
  const userId = session?.user?.id ?? null
  const hasStoredToken = useHasStoredToken()

  const checkProfile = useCallback(
    async () => (userId ? fetchHasProfile() : false),
    [userId],
  )
  // A failed check leaves hasProfile undefined, so onboarding stays open.
  const { data: hasProfile, status: profileStatus } = useAsyncData(checkProfile)

  const isAuthed = Platform.OS === "web" ? hasStoredToken : isPending ? null : userId !== null
  const checking = isPending || isAuthed === null || profileStatus === "loading"

  // Only the first check blocks rendering; later ones (e.g. right after
  // sign-up on the name step) run in the background so the flow isn't
  // interrupted by a spinner.
  const [settled, setSettled] = useState(false)
  if (!settled && !checking) setSettled(true)

  if (onboardingRouteRequiresAuth(pathname) && isAuthed === false) {
    return <Redirect href={"/" as Href} />
  }

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
      />
    </OnboardingProvider>
  )
}
