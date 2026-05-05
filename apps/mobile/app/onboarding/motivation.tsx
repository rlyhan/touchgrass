import { router, type Href } from "expo-router"
import { Controller, useWatch } from "react-hook-form"
import { View } from "react-native"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { OptionCard } from "@/components/ui/option-card"
import { PrimaryButton } from "@/components/ui/primary-button"
import { useOnboardingForm } from "@/lib/onboarding/context"
import { MOTIVATION_OPTIONS } from "@/lib/onboarding/options"

export default function MotivationScreen() {
  const { control, handleSubmit } = useOnboardingForm()
  const motivations = useWatch({ control, name: "motivations" })
  const canContinue = motivations.length >= 1

  const onSubmit = handleSubmit(() => {
    router.replace("/onboarding/loading" as Href)
  })

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
          const toggle = (option: string) => {
            const next = value.includes(option)
              ? value.filter((m) => m !== option)
              : [...value, option]
            onChange(next)
          }

          return (
            <View className="gap-3">
              {MOTIVATION_OPTIONS.map((option) => (
                <OptionCard
                  key={option}
                  label={option}
                  selected={value.includes(option)}
                  onPress={() => toggle(option)}
                />
              ))}
            </View>
          )
        }}
      />
    </OnboardingScreenShell>
  )
}
