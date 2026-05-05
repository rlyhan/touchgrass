import { router, type Href } from "expo-router"
import { Controller, useWatch } from "react-hook-form"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { PrimaryButton } from "@/components/ui/primary-button"
import { TextField } from "@/components/ui/text-field"
import { useOnboardingForm } from "@/lib/onboarding/context"

const NEXT: Href = "/onboarding/basic-details" as Href

export default function NameScreen() {
  const { control } = useOnboardingForm()
  const name = useWatch({ control, name: "name" })
  const canContinue = name.trim().length > 0

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
      <Controller
        control={control}
        name="name"
        rules={{ required: true, validate: (v) => v.trim().length > 0 }}
        render={({ field: { value, onChange, onBlur } }) => (
          <TextField
            label="Name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Your name"
            autoCapitalize="words"
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => {
              if (canContinue) router.push(NEXT)
            }}
          />
        )}
      />
    </OnboardingScreenShell>
  )
}
