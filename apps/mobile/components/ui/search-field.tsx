import { Search, X } from "lucide-react-native"
import { useState } from "react"
import { Pressable, TextInput, View, type TextInputProps } from "react-native"

import { colors } from "@/lib/theme/colors"

type Props = Omit<TextInputProps, "value" | "onChangeText"> & {
  label: string
  value: string
  onChangeText: (text: string) => void
}

export function SearchField({ label, value, onChangeText, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false)

  return (
    <View
      className={`h-12 flex-row items-center rounded-2xl border bg-white px-4 ${focused ? "border-emerald-500" : "border-gray-200"}`}
    >
      <Search size={18} color={colors.gray[400]} />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        {...inputProps}
        value={value}
        onChangeText={onChangeText}
        onFocus={(e) => {
          setFocused(true)
          inputProps.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          inputProps.onBlur?.(e)
        }}
        placeholder={inputProps.placeholder ?? label}
        accessibilityLabel={label}
        placeholderTextColor={colors.gray[400]}
        textAlignVertical="center"
        className="ml-2 h-full flex-1 py-0 text-[16px] text-gray-900 web:outline-none"
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
