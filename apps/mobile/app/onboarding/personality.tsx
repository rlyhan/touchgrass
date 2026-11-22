import { router, type Href } from "expo-router"

import { PersonalityStep } from "@/components/onboarding/personality-step"
import { PrimaryButton } from "@/components/ui/primary-button"
import { ONBOARDING_ROUTES } from "@/lib/onboarding/routes"

export default function PersonalityScreen() {
  function goNext() { router.push(ONBOARDING_ROUTES.motivation as Href) }

  return (
    <PersonalityStep
      step={4}
      totalSteps={5}
      backHref={ONBOARDING_ROUTES.interests as Href}
      footer={<PrimaryButton label="Continue" onPress={goNext} />}
    />
  )
}
