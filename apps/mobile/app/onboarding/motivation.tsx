import { router, type Href } from "expo-router"
import { useWatch } from "react-hook-form"

import { MotivationStep } from "@/components/onboarding/motivation-step"
import { PrimaryButton } from "@/components/ui/primary-button"
import { useOnboardingForm } from "@/lib/onboarding/context"
import { ONBOARDING_ROUTES } from "@/lib/onboarding/routes"

export default function MotivationScreen() {
  const { control, handleSubmit } = useOnboardingForm()
  const motivations = useWatch({ control, name: "motivations" })
  const canContinue = motivations.length >= 1

  const onSubmit = handleSubmit(() => router.replace(ONBOARDING_ROUTES.loading as Href))

  return (
    <MotivationStep
      step={5}
      totalSteps={5}
      backHref={ONBOARDING_ROUTES.personality as Href}
      footer={
        <PrimaryButton
          label="Finish"
          disabled={!canContinue}
          onPress={onSubmit}
        />
      }
    />
  )
}
