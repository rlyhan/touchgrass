import { router, type Href } from "expo-router"
import { Controller } from "react-hook-form"
import { View } from "react-native"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { SkipButton } from "@/components/onboarding/skip-button"
import { PrimaryButton } from "@/components/ui/primary-button"
import { Slider } from "@/components/ui/slider"
import { useOnboardingForm } from "@/lib/onboarding-context"
import {
  DEFAULT_PERSONALITY_SCORES,
  PERSONALITY_TRAITS,
} from "@/lib/types"

export default function PersonalityScreen() {
  const { control, setValue } = useOnboardingForm()

  const goNext = () => router.push("/onboarding/motivation" as Href)
  const skip = () => {
    setValue("personality", { ...DEFAULT_PERSONALITY_SCORES })
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
      <Controller
        control={control}
        name="personality"
        rules={{
          validate: (scores) =>
            PERSONALITY_TRAITS.every(
              (t) => typeof scores[t.key] === "number",
            ),
        }}
        render={({ field: { value, onChange } }) => (
          <View className="gap-7">
            {PERSONALITY_TRAITS.map((trait) => (
              <Slider
                key={trait.key}
                label={trait.label}
                description={trait.description}
                lowLabel={trait.lowLabel}
                highLabel={trait.highLabel}
                value={value[trait.key]}
                onChange={(score) =>
                  onChange({ ...value, [trait.key]: score })
                }
              />
            ))}
          </View>
        )}
      />
    </OnboardingScreenShell>
  )
}
