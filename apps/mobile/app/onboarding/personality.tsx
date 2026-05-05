import { router, type Href } from "expo-router"
import { Controller } from "react-hook-form"
import { Text, View } from "react-native"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { PrimaryButton } from "@/components/ui/primary-button"
import { Slider } from "@/components/ui/slider"
import { useOnboardingForm } from "@/lib/onboarding/context"
import { BFAS_PARENT_LABELS, BFAS_TRAITS } from "@touchgrass/types/constants"
import type { BFASTraitDefinition, PersonalityTrait } from "@touchgrass/types"

type TraitGroup = { parent: PersonalityTrait; traits: BFASTraitDefinition[] }

const BFAS_GROUPS: TraitGroup[] = BFAS_TRAITS.reduce<TraitGroup[]>(
  (acc, trait) => {
    const last = acc[acc.length - 1]
    if (last && last.parent.key === trait.parent.key) {
      last.traits.push(trait)
    } else {
      acc.push({ parent: trait.parent, traits: [trait] })
    }
    return acc
  },
  [],
)

export default function PersonalityScreen() {
  const { control } = useOnboardingForm()

  const goNext = () => router.push("/onboarding/motivation" as Href)

  return (
    <OnboardingScreenShell
      step={4}
      totalSteps={5}
      title="How would you describe your personality?"
      subtitle="These traits are based off the Big Five Aspect Scale (BFAS)."
      footer={<PrimaryButton label="Continue" onPress={goNext} />}
    >
      <Controller
        control={control}
        name="personality"
        rules={{
          validate: (scores) =>
            BFAS_TRAITS.every(
              (t) => typeof scores[t.key] === "number",
            ),
        }}
        render={({ field: { value, onChange } }) => (
          <View className="gap-8">
            {BFAS_GROUPS.map((group) => (
              <View key={group.parent.key} className="gap-7">
                <Text className="text-xl font-bold text-gray-900">
                  {BFAS_PARENT_LABELS[group.parent.key]}
                </Text>
                {group.traits.map((trait) => (
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
            ))}
          </View>
        )}
      />
    </OnboardingScreenShell>
  )
}
