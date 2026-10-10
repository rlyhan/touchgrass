import { router, type Href } from "expo-router"
import { LogOut, X } from "lucide-react-native"
import { useState } from "react"
import { Modal, Pressable, Text, View } from "react-native"
import Animated, { SlideInRight } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { signOut, useSession } from "@/lib/auth/client"
import { clearPatternWeightsCache } from "@/lib/patterns/cache"
import { colors } from "@/lib/theme/colors"

type Props = {
  visible: boolean
  onClose: () => void
}

export function MenuDrawer({ visible, onClose }: Props) {
  const { top, bottom } = useSafeAreaInsets()
  const { data: session } = useSession()
  const name = session?.user?.name?.trim()
  const [loggingOut, setLoggingOut] = useState(false)
  const [logOutFailed, setLogOutFailed] = useState(false)

  function handleClose() {
    setLogOutFailed(false)
    onClose()
  }

  async function handleLogOut() {
    setLoggingOut(true)
    setLogOutFailed(false)
    let failed: boolean
    try {
      const { error } = await signOut()
      failed = Boolean(error)
    } catch {
      failed = true
    }
    setLoggingOut(false)
    if (failed) {
      setLogOutFailed(true)
      return
    }
    // Drop cached pattern weights so the next user doesn't inherit them.
    clearPatternWeightsCache()
    onClose()
    router.replace("/sign-in" as Href)
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable
        onPress={handleClose}
        className="absolute inset-0 bg-black/40"
        accessibilityRole="button"
        accessibilityLabel="Close menu"
      />
      <Animated.View
        entering={SlideInRight.duration(220)}
        className="ml-auto h-full bg-white px-6"
        style={{ width: "80%", maxWidth: 360, paddingTop: top + 16, paddingBottom: bottom + 16 }}
      >
        <View className="flex-row items-start">
          {name ? (
            <Text
              testID="menu-user-name"
              className="flex-1 pr-4 pt-2 text-2xl font-bold tracking-tight text-gray-900"
            >
              {name}
            </Text>
          ) : null}
          <Pressable
            onPress={handleClose}
            className="-mr-2 ml-auto h-11 w-11 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          >
            <X size={24} strokeWidth={2} color={colors.gray[600]} />
          </Pressable>
        </View>

        <View className="mt-6 border-t border-gray-200 pt-2">
          <Pressable
            onPress={handleLogOut}
            disabled={loggingOut}
            className="flex-row items-center gap-3 py-4"
            accessibilityRole="button"
            accessibilityLabel={loggingOut ? "Logging out" : "Log out"}
            accessibilityState={{ disabled: loggingOut }}
          >
            <LogOut size={22} strokeWidth={2} color={colors.gray[900]} />
            <Text className="text-base font-medium text-gray-900">
              {loggingOut ? "Logging out…" : "Log out"}
            </Text>
          </Pressable>
          {logOutFailed ? (
            <Text accessibilityRole="alert" className="text-sm text-red-600">
              Couldn&apos;t log out. Try again.
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </Modal>
  )
}
