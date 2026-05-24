import { Text, TextInput, View, type TextInputProps } from "react-native"

import { colors } from "@/lib/theme/colors"

type Props = TextInputProps & {
  label: string
}

export function TextField({ label, ...inputProps }: Props) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        placeholderTextColor={colors.gray[400]}
        className="h-14 rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900"
      />
    </View>
  )
}
