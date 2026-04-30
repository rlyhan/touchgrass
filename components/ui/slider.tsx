import RNSlider from "@react-native-community/slider"
import { Text, View } from "react-native"

type Props = {
  value: number
  onChange: (value: number) => void
  label?: string
  description?: string
  lowLabel?: string
  highLabel?: string
  showValue?: boolean
  min?: number
  max?: number
  step?: number
}

export function Slider({
  value,
  onChange,
  label,
  description,
  lowLabel,
  highLabel,
  showValue,
  min = 0,
  max = 100,
  step = 1,
}: Props) {
  const shouldShowValue = showValue ?? Boolean(label)
  const hasAnchors = Boolean(lowLabel || highLabel)

  return (
    <View className="gap-2">
      {(label || shouldShowValue) && (
        <View className="flex-row items-baseline justify-between">
          {label ? (
            <Text className="text-base font-semibold text-gray-900">
              {label}
            </Text>
          ) : null}
          {shouldShowValue ? (
            <Text className="text-sm font-medium text-emerald-600">
              {Math.round(value)}
            </Text>
          ) : null}
        </View>
      )}
      {description ? (
        <Text className="text-sm text-gray-500">{description}</Text>
      ) : null}
      <RNSlider
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#10b981"
        maximumTrackTintColor="#e5e7eb"
        thumbTintColor="#10b981"
        style={{ width: "100%", height: 36 }}
      />
      {hasAnchors ? (
        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-500">{lowLabel}</Text>
          <Text className="text-xs text-gray-500">{highLabel}</Text>
        </View>
      ) : null}
    </View>
  )
}
