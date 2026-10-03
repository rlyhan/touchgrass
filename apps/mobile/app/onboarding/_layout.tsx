import { router, Stack, usePathname, type Href } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Platform, View } from "react-native"

import { useSession } from "@/lib/auth/client"
import { getStoredToken } from "@/lib/auth/token-store"
import { fetchHasProfile } from "@/lib/onboarding/api"
import { OnboardingProvider } from "@/lib/onboarding/context"
import { onboardingRouteRequiresAuth } from "@/lib/onboarding/routes"
import { colors } from "@/lib/theme/colors"

// Keeps people out of onboarding steps that don't apply to them:
// - signed out on a post-sign-up step (e.g. a pasted /onboarding/basic-details
//   URL) → home. On web the bearer token lives in localStorage, so we can check
//   synchronously; native stores it in SecureStore, so use the session hook.
// - signed in with a profile already created → recommendations.
// Signed-in users *without* a profile stay put: that's how the recommendations
// screen sends people back to finish an interrupted onboarding.
//
// Returns false until the first check settles so screens don't flash before a
// redirect. Later checks (e.g. right after sign-up on the name step) run in
// the background so the flow isn't interrupted by a spinner.
function useOnboardingGuard(): boolean {
  const pathname = usePathname()
  const { data: session, isPending } = useSession()
  const userId = session?.user?.id ?? null
  const requiresAuth = onboardingRouteRequiresAuth(pathname)
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    if (!requiresAuth) return
    const hasAuth =
      Platform.OS === "web" ? getStoredToken() !== null : isPending || userId !== null
    if (!hasAuth) router.replace("/" as Href)
  }, [requiresAuth, isPending, userId])

  useEffect(() => {
    if (!userId || checkedUserId === userId) return
    let cancelled = false
    fetchHasProfile()
      .then((hasProfile) => {
        if (cancelled) return
        if (hasProfile) router.replace("/recommendations" as Href)
        else setCheckedUserId(userId)
      })
      .catch((err) => {
        // Fail open: a flaky profile check shouldn't block onboarding.
        console.error("Onboarding profile check failed", err)
        if (!cancelled) setCheckedUserId(userId)
      })
    return () => {
      cancelled = true
    }
  }, [userId, checkedUserId])

  const checking = isPending || (userId !== null && checkedUserId !== userId)

  useEffect(() => {
    if (!checking) setSettled(true)
  }, [checking])

  return settled || !checking
}

export default function OnboardingLayout() {
  const ready = useOnboardingGuard()

  if (!ready) {
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
