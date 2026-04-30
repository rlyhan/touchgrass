import { View } from "react-native"

type Props = {
  step: number
  totalSteps: number
}

export function OnboardingProgress({ step, totalSteps }: Props) {
  return (
    <View className="flex-row gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const active = i < step
        return (
          <View
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              active ? "bg-emerald-500" : "bg-gray-200"
            }`}
          />
        )
      })}
    </View>
  )
}
