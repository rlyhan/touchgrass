import * as Haptics from "expo-haptics"
import { Home, Menu, Search, type LucideIcon } from "lucide-react-native"
import { Pressable, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors } from "@/lib/theme/colors"

export type BottomNavTab = "home" | "browse"

const TABS: { key: BottomNavTab; label: string; Icon: LucideIcon }[] = [
  { key: "home", label: "Home", Icon: Home },
  { key: "browse", label: "Browse", Icon: Search },
]

type Props = {
  activeTab: BottomNavTab
  onTabPress: (tab: BottomNavTab) => void
  onMenuPress: () => void
}

export function BottomNav({ activeTab, onTabPress, onMenuPress }: Props) {
  const { bottom } = useSafeAreaInsets()

  function handlePress(tab: BottomNavTab) {
    if (tab === activeTab) return
    Haptics.selectionAsync()
    onTabPress(tab)
  }

  function handleMenuPress() {
    Haptics.selectionAsync()
    onMenuPress()
  }

  return (
    <View
      testID="bottom-nav"
      accessibilityRole="tablist"
      className="flex-row justify-center gap-4 border-t border-gray-200 bg-white pt-2"
      style={{ paddingBottom: Math.max(bottom, 8) }}
    >
      {TABS.map(({ key, label, Icon }) => {
        const active = key === activeTab
        return (
          <Pressable
            key={key}
            onPress={() => handlePress(key)}
            className={`h-14 w-14 items-center justify-center rounded-xl ${active ? "bg-green-800" : ""}`}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: active }}
          >
            <Icon size={24} strokeWidth={2} color={active ? colors.white : colors.gray[600]} />
          </Pressable>
        )
      })}
      <Pressable
        onPress={handleMenuPress}
        className="h-14 w-14 items-center justify-center rounded-xl"
        accessibilityRole="button"
        accessibilityLabel="Open menu"
      >
        <Menu size={24} strokeWidth={2} color={colors.gray[600]} />
      </Pressable>
    </View>
  )
}
