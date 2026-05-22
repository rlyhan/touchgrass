import { Pressable, Text } from "react-native"

type Props = {
  onPress: () => void
}

export function SkipButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Skip"
      className="mt-3 h-12 items-center justify-center"
    >
      <Text className="text-base font-medium text-gray-500">Skip</Text>
    </Pressable>
  )
}
