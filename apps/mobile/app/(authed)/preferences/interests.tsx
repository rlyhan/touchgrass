import { router, type Href } from "expo-router"

import { InterestsStep } from "@/components/onboarding/interests-step"
import { PrimaryButton } from "@/components/ui/primary-button"
import { PREFERENCES_ROUTES } from "@/lib/preferences/routes"

export default function PreferencesInterestsScreen() {
  return (
    <InterestsStep
      step={1}
      totalSteps={3}
      backHref={"/recommendations" as Href}
      footer={
        <PrimaryButton
          label="Continue"
          onPress={() => router.push(PREFERENCES_ROUTES.personality as Href)}
        />
      }
    />
  )
}
