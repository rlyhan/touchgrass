import { Text, View } from "react-native"

type Props = {
  label: string
  children: React.ReactNode
}

export function FieldRow({ label, children }: Props) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      {children}
    </View>
  )
}
