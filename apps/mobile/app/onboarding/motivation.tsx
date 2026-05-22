import { router, type Href } from "expo-router"
import { useCallback } from "react"
import { Controller, useWatch } from "react-hook-form"
import { View } from "react-native"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { OptionCard } from "@/components/ui/option-card"
import { PrimaryButton } from "@/components/ui/primary-button"
import { useOnboardingForm } from "@/lib/onboarding/context"
import { toggleItem } from "@/lib/toggle-item"
import { MOTIVATION_OPTIONS } from "@touchgrass/types/constants"

export default function MotivationScreen() {
  const { control, handleSubmit } = useOnboardingForm()
  const motivations = useWatch({ control, name: "motivations" })
  const canContinue = motivations.length >= 1

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSubmit = useCallback(
    handleSubmit(() => router.replace("/onboarding/loading" as Href)),
    [handleSubmit],
  )

  return (
    <OnboardingScreenShell
      step={5}
      totalSteps={5}
      title="Why are you looking for a new hobby/activity?"
      footer={
        <PrimaryButton
          label="Finish"
          disabled={!canContinue}
          onPress={onSubmit}
        />
      }
    >
      <Controller
        control={control}
        name="motivations"
        rules={{ validate: (v) => v.length >= 1 }}
        render={({ field: { value, onChange } }) => {
          return (
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
          )
        }}
      />
    </OnboardingScreenShell>
  )
}
