import { router, type Href } from "expo-router"

import { PersonalityStep } from "@/components/onboarding/personality-step"
import { PrimaryButton } from "@/components/ui/primary-button"
import { PREFERENCES_ROUTES } from "@/lib/preferences/routes"

export default function PreferencesPersonalityScreen() {
  return (
    <PersonalityStep
      step={2}
      totalSteps={3}
      backHref={PREFERENCES_ROUTES.interests as Href}
      footer={
        <PrimaryButton
          label="Continue"
          onPress={() => router.push(PREFERENCES_ROUTES.motivation as Href)}
        />
      }
    />
  )
}
