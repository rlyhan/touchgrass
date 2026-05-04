import { Pressable, Text, View } from "react-native"
import type { LucideIcon } from "lucide-react-native"

type Props = {
  label: string
  selected: boolean
  onPress: () => void
  icon?: LucideIcon
}

export function Chip({ label, selected, onPress, icon: Icon }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-2 rounded-full border px-4 py-2.5 ${
        selected
          ? "border-emerald-500 bg-emerald-50"
          : "border-gray-200 bg-white"
      }`}
    >
      {Icon ? (
        <Icon size={16} color={selected ? "#059669" : "#4b5563"} />
      ) : null}
      <Text
        className={`text-sm font-medium ${
          selected ? "text-emerald-700" : "text-gray-700"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  )
}

export function ChipGroup({ children }: { children: React.ReactNode }) {
  return <View className="flex-row flex-wrap gap-2">{children}</View>
}
