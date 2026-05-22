import { Pressable, Text, View } from "react-native"
import { Check } from "lucide-react-native"

type Props = {
  label: string
  selected: boolean
  onPress: () => void
}

export function OptionCard({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      className={`flex-row items-center gap-3 rounded-2xl border px-4 py-4 ${
        selected
          ? "border-emerald-500 bg-emerald-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <View
        className={`h-6 w-6 items-center justify-center rounded-full border ${
          selected
            ? "border-emerald-500 bg-emerald-500"
            : "border-gray-300 bg-white"
        }`}
      >
        {selected ? <Check size={14} color="#ffffff" strokeWidth={3} /> : null}
      </View>
      <Text
        className={`flex-1 text-base ${
          selected ? "font-medium text-emerald-800" : "text-gray-800"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  )
}
