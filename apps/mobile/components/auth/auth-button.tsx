import { router, type Href } from "expo-router"
import { useCallback, useState } from "react"
import { Pressable, Text, View } from "react-native"

import { signOut, useSession } from "@/lib/auth/client"
import { clearPatternWeightsCache } from "@/lib/patterns/cache"

export function AuthButton({ className = "" }: { className?: string }) {
  const { data: session, isPending } = useSession()
  const [signingOut, setSigningOut] = useState(false)
  const [signOutFailed, setSignOutFailed] = useState(false)
  const signedIn = Boolean(session?.user)

  const handlePress = useCallback(async () => {
    if (!signedIn) {
      router.push("/sign-in" as Href)
      return
    }
    setSigningOut(true)
    setSignOutFailed(false)
    let failed: boolean
    try {
      const { error } = await signOut()
      failed = Boolean(error)
    } catch {
      failed = true
    }
    setSigningOut(false)
    if (failed) {
      setSignOutFailed(true)
      return
    }
    // Drop cached pattern weights so the next user doesn't inherit them.
    clearPatternWeightsCache()
    router.replace("/sign-in" as Href)
  }, [signedIn])

  if (isPending) return null

  const label = signedIn ? "Sign out" : "Sign in"

  return (
    <View className={`items-center ${className}`}>
      <Pressable
        onPress={handlePress}
        disabled={signingOut}
        className="rounded-full border border-gray-300 px-5 py-2"
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text className="text-sm font-medium text-gray-700">
          {signingOut ? "Signing out..." : label}
        </Text>
      </Pressable>
      {signOutFailed && signedIn ? (
        <Text accessibilityRole="alert" className="mt-2 text-sm text-red-600">
          Couldn&apos;t sign out. Try again.
        </Text>
      ) : null}
    </View>
  )
}
