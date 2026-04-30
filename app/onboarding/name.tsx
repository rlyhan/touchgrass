import { router, type Href } from "expo-router"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { PrimaryButton } from "@/components/ui/primary-button"
import { TextField } from "@/components/ui/text-field"
import { useOnboarding } from "@/lib/onboarding-context"

const NEXT: Href = "/onboarding/basic-details" as Href

export default function NameScreen() {
  const { profile, update } = useOnboarding()
  const canContinue = profile.name.trim().length > 0

  return (
    <OnboardingScreenShell
      step={1}
      totalSteps={5}
      title="What's your name?"
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push(NEXT)}
        />
      }
    >
      <TextField
        label="Name"
        value={profile.name}
        onChangeText={(value) => update("name", value)}
        placeholder="Your name"
        autoCapitalize="words"
        autoFocus
        returnKeyType="next"
        onSubmitEditing={() => {
          if (canContinue) router.push(NEXT)
        }}
      />
    </OnboardingScreenShell>
  )
}
