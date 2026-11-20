import { router, type Href } from "expo-router"
import { useState } from "react"
import { useWatch } from "react-hook-form"
import { Text, View } from "react-native"

import { MotivationStep } from "@/components/onboarding/motivation-step"
import { PrimaryButton } from "@/components/ui/primary-button"
import { UnauthenticatedError } from "@/lib/auth/errors"
import { updatePreferences } from "@/lib/onboarding/api"
import { useOnboardingForm } from "@/lib/onboarding/context"
import { PREFERENCES_ROUTES } from "@/lib/preferences/routes"

export default function PreferencesMotivationScreen() {
  const { control, handleSubmit } = useOnboardingForm()
  const motivations = useWatch({ control, name: "motivations" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = handleSubmit(async ({ interests, personality, motivations }) => {
    setSaving(true)
    setError(null)
    try {
      await updatePreferences({ interests, personality, motivations })
      router.dismissTo("/recommendations" as Href)
    } catch (err) {
      if (err instanceof UnauthenticatedError) {
        router.replace("/sign-in" as Href)
        return
      }
      setError(
        err instanceof TypeError
          ? "Check your connection and try again."
          : "Couldn't save your changes. Try again.",
      )
    } finally {
      setSaving(false)
    }
  })

  return (
    <MotivationStep
      step={3}
      totalSteps={3}
      backHref={PREFERENCES_ROUTES.personality as Href}
      footer={
        <View className="gap-3">
          {error ? (
            <Text accessibilityRole="alert" className="text-center text-sm text-red-600">
              {error}
            </Text>
          ) : null}
          <PrimaryButton
            label={saving ? "Saving…" : "Save changes"}
            disabled={motivations.length < 1 || saving}
            onPress={onSubmit}
          />
        </View>
      }
    />
  )
}
