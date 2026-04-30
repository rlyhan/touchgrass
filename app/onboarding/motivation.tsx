import { router, type Href } from "expo-router"
import { View } from "react-native"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { OptionCard } from "@/components/ui/option-card"
import { PrimaryButton } from "@/components/ui/primary-button"
import { MOTIVATION_OPTIONS, useOnboarding } from "@/lib/onboarding-context"

export default function MotivationScreen() {
  const { profile, update } = useOnboarding()

  const toggle = (option: string) => {
    const next = profile.motivations.includes(option)
      ? profile.motivations.filter((m) => m !== option)
      : [...profile.motivations, option]
    update("motivations", next)
  }

  const canContinue = profile.motivations.length >= 1

  return (
    <OnboardingScreenShell
      step={5}
      totalSteps={5}
      title="Why are you looking for a new hobby/activity?"
      footer={
        <PrimaryButton
          label="Finish"
          disabled={!canContinue}
          onPress={() => router.replace("/recommendations" as Href)}
        />
      }
    >
      <View className="gap-3">
        {MOTIVATION_OPTIONS.map((option) => (
          <OptionCard
            key={option}
            label={option}
            selected={profile.motivations.includes(option)}
            onPress={() => toggle(option)}
          />
        ))}
      </View>
    </OnboardingScreenShell>
  )
}
