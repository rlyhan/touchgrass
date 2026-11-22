import { router, type Href } from "expo-router"
import { View } from "react-native"

import { InterestsStep } from "@/components/onboarding/interests-step"
import { SkipButton } from "@/components/onboarding/skip-button"
import { PrimaryButton } from "@/components/ui/primary-button"
import { useOnboardingForm } from "@/lib/onboarding/context"
import { ONBOARDING_ROUTES } from "@/lib/onboarding/routes"

export default function InterestsScreen() {
  const { setValue } = useOnboardingForm()

  function goNext() { router.push(ONBOARDING_ROUTES.personality as Href) }
  function skip() {
    setValue("interests", [])
    goNext()
  }

  return (
    <InterestsStep
      step={3}
      totalSteps={5}
      backHref={ONBOARDING_ROUTES.basicDetails as Href}
      footer={
        <View>
          <PrimaryButton label="Continue" onPress={goNext} />
          <SkipButton onPress={skip} />
        </View>
      }
    />
  )
}
