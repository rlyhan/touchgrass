import { router, Stack, usePathname, type Href } from "expo-router"
import { useEffect } from "react"
import { Platform } from "react-native"

import { useSession } from "@/lib/auth/client"
import { getStoredToken } from "@/lib/auth/token-store"
import { OnboardingProvider } from "@/lib/onboarding/context"

// The name step is where sign-up happens, so it's the only onboarding screen
// reachable without a session. Every later step assumes an account exists.
const PUBLIC_ONBOARDING_PATHS = new Set(["/onboarding/name"])

// Temporary guard: send unauthenticated visitors who land directly on a
// mid-flow step (e.g. a pasted /onboarding/basic-details URL) back home.
// On web the bearer token lives in localStorage, so we can check synchronously
// on mount; native stores it in SecureStore, so fall back to the session hook.
function useRedirectIfUnauthenticated() {
  const pathname = usePathname()
  const { data: session, isPending } = useSession()
  const isPublic = PUBLIC_ONBOARDING_PATHS.has(pathname)

  useEffect(() => {
    if (isPublic) return
    const hasAuth =
      Platform.OS === "web" ? getStoredToken() !== null : isPending || !!session?.user
    if (!hasAuth) router.replace("/" as Href)
  }, [isPublic, isPending, session])
}

export default function OnboardingLayout() {
  useRedirectIfUnauthenticated()

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
