import { Pressable, Text } from "react-native"

type Props = {
  label: string
  onPress: () => void
  disabled?: boolean
}

export function PrimaryButton({ label, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`h-14 items-center justify-center rounded-2xl ${
        disabled ? "bg-gray-200" : "bg-emerald-500 active:bg-emerald-600"
      }`}
    >
      <Text
        className={`text-base font-semibold ${
          disabled ? "text-gray-400" : "text-white"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  )
}
