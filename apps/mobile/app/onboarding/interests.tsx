import { router, type Href } from "expo-router"
import { Controller } from "react-hook-form"
import { View } from "react-native"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { SkipButton } from "@/components/onboarding/skip-button"
import { Chip, ChipGroup } from "@/components/ui/chip"
import { PrimaryButton } from "@/components/ui/primary-button"
import { getFieldIcon } from "@/lib/icons"
import { useOnboardingForm } from "@/lib/onboarding-context"
import {
  ACTIVITY_FIELDS,
  type ActivityField,
} from "@touchgrass/types"

export default function InterestsScreen() {
  const { control, setValue } = useOnboardingForm()

  const goNext = () => router.push("/onboarding/personality" as Href)
  const skip = () => {
    setValue("interests", [])
    goNext()
  }

  return (
    <OnboardingScreenShell
      step={3}
      totalSteps={5}
      title="Pick a few things you're interested in."
      subtitle="Don't worry if you can't think of anything right now."
      footer={
        <View>
          <PrimaryButton label="Continue" onPress={goNext} />
          <SkipButton onPress={skip} />
        </View>
      }
    >
      <Controller
        control={control}
        name="interests"
        render={({ field: { value, onChange } }) => {
          const toggle = (field: ActivityField) => {
            const next = value.includes(field)
              ? value.filter((f) => f !== field)
              : [...value, field]
            onChange(next)
          }

          return (
            <ChipGroup>
              {ACTIVITY_FIELDS.map((field) => (
                <Chip
                  key={field}
                  label={field}
                  icon={getFieldIcon(field)}
                  selected={value.includes(field)}
                  onPress={() => toggle(field)}
                />
              ))}
            </ChipGroup>
          )
        }}
      />
    </OnboardingScreenShell>
  )
}
