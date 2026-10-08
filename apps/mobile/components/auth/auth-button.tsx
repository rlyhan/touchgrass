import { router, type Href } from "expo-router"
import { useCallback, useState } from "react"
import { Pressable, Text } from "react-native"

import { signOut, useSession } from "@/lib/auth/client"
import { clearPatternWeightsCache } from "@/lib/patterns/cache"

export function AuthButton({ className = "" }: { className?: string }) {
  const { data: session, isPending } = useSession()
  const [signingOut, setSigningOut] = useState(false)
  const signedIn = Boolean(session?.user)

  const handlePress = useCallback(async () => {
    if (!signedIn) {
      router.push("/sign-in" as Href)
      return
    }
    setSigningOut(true)
    await signOut()
    // Drop cached pattern weights so the next user doesn't inherit them.
    clearPatternWeightsCache()
    router.replace("/sign-in" as Href)
  }, [signedIn])

  if (isPending) return null

  const label = signedIn ? "Sign out" : "Sign in"

  return (
    <Pressable
      onPress={handlePress}
      disabled={signingOut}
      className={`rounded-full border border-gray-300 px-5 py-2 ${className}`}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text className="text-sm font-medium text-gray-700">
        {signingOut ? "Signing out..." : label}
      </Text>
    </Pressable>
  )
}
