import { router, type Href } from "expo-router"
import { View } from "react-native"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { SkipButton } from "@/components/onboarding/skip-button"
import { PrimaryButton } from "@/components/ui/primary-button"
import { Slider } from "@/components/ui/slider"
import { useOnboarding } from "@/lib/onboarding-context"
import {
  DEFAULT_PERSONALITY_SCORES,
  PERSONALITY_TRAITS,
} from "@/lib/types"

export default function PersonalityScreen() {
  const { profile, update } = useOnboarding()

  const goNext = () => router.push("/onboarding/motivation" as Href)
  const skip = () => {
    update("personality", { ...DEFAULT_PERSONALITY_SCORES })
    goNext()
  }

  return (
    <OnboardingScreenShell
      step={4}
      totalSteps={5}
      title="How would you describe your personality?"
      subtitle="Don't worry if you can't think of anything right now."
      footer={
        <View>
          <PrimaryButton label="Continue" onPress={goNext} />
          <SkipButton onPress={skip} />
        </View>
      }
    >
      <View className="gap-7">
        {PERSONALITY_TRAITS.map((trait) => (
          <Slider
            key={trait.key}
            label={trait.label}
            description={trait.description}
            lowLabel={trait.lowLabel}
            highLabel={trait.highLabel}
            value={profile.personality[trait.key]}
            onChange={(value) =>
              update("personality", {
                ...profile.personality,
                [trait.key]: value,
              })
            }
          />
        ))}
      </View>
    </OnboardingScreenShell>
  )
}
