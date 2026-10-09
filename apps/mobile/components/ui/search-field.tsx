import { Search, X } from "lucide-react-native"
import { Pressable, TextInput, View, type TextInputProps } from "react-native"

import { colors } from "@/lib/theme/colors"

type Props = Omit<TextInputProps, "value" | "onChangeText"> & {
  label: string
  value: string
  onChangeText: (text: string) => void
}

export function SearchField({ label, value, onChangeText, ...inputProps }: Props) {
  return (
    <View className="h-12 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4">
      <Search size={18} color={colors.gray[400]} />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        {...inputProps}
        value={value}
        onChangeText={onChangeText}
        placeholder={inputProps.placeholder ?? label}
        accessibilityLabel={label}
        placeholderTextColor={colors.gray[400]}
        className="ml-2 h-full flex-1 text-base text-gray-900"
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          className="ml-2"
        >
          <X size={18} color={colors.gray[500]} />
        </Pressable>
      ) : null}
    </View>
  )
}
