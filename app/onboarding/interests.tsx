import { router, type Href } from "expo-router"
import { View } from "react-native"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { SkipButton } from "@/components/onboarding/skip-button"
import { Chip, ChipGroup } from "@/components/ui/chip"
import { PrimaryButton } from "@/components/ui/primary-button"
import { getFieldIcon } from "@/lib/icons"
import { useOnboarding } from "@/lib/onboarding-context"
import {
  ACTIVITY_FIELDS,
  type ActivityField,
} from "@/lib/types"

export default function InterestsScreen() {
  const { profile, update } = useOnboarding()

  const toggle = (field: ActivityField) => {
    const next = profile.interests.includes(field)
      ? profile.interests.filter((f) => f !== field)
      : [...profile.interests, field]
    update("interests", next)
  }

  const goNext = () => router.push("/onboarding/personality" as Href)
  const skip = () => {
    update("interests", [])
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
      <ChipGroup>
        {ACTIVITY_FIELDS.map((field) => (
          <Chip
            key={field}
            label={field}
            icon={getFieldIcon(field)}
            selected={profile.interests.includes(field)}
            onPress={() => toggle(field)}
          />
        ))}
      </ChipGroup>
    </OnboardingScreenShell>
  )
}
