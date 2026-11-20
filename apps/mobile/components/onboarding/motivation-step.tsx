import type { Href } from "expo-router"
import type { ReactNode } from "react"
import { Controller } from "react-hook-form"
import { View } from "react-native"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { OptionCard } from "@/components/ui/option-card"
import { useOnboardingForm } from "@/lib/onboarding/context"
import { toggleItem } from "@/lib/toggle-item"
import { MOTIVATION_OPTIONS } from "@touchgrass/types/constants"

type Props = {
  step: number
  totalSteps: number
  backHref: Href
  footer: ReactNode
}

export function MotivationStep({ step, totalSteps, backHref, footer }: Props) {
  const { control } = useOnboardingForm()

  return (
    <OnboardingScreenShell
      step={step}
      totalSteps={totalSteps}
      backHref={backHref}
      title="Why are you looking for a new hobby/activity?"
      footer={footer}
    >
      <Controller
        control={control}
        name="motivations"
        rules={{ validate: (v) => v.length >= 1 }}
        render={({ field: { value, onChange } }) => (
          <View className="gap-3">
            {MOTIVATION_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                selected={value.includes(option.value)}
                onPress={() => onChange(toggleItem(value, option.value))}
              />
            ))}
          </View>
        )}
      />
    </OnboardingScreenShell>
  )
}
