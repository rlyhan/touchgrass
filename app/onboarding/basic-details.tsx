import { router, type Href } from "expo-router"
import { View } from "react-native"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { Chip, ChipGroup } from "@/components/ui/chip"
import { FieldRow } from "@/components/ui/field-row"
import { PrimaryButton } from "@/components/ui/primary-button"
import { TextField } from "@/components/ui/text-field"
import {
  BUILD_OPTIONS,
  EMPLOYMENT_OPTIONS,
  GENDER_OPTIONS,
  useOnboarding,
} from "@/lib/onboarding-context"

const BIRTHDATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/

export default function BasicDetailsScreen() {
  const { profile, update } = useOnboarding()

  const canContinue =
    BIRTHDATE_PATTERN.test(profile.birthdate.trim()) &&
    profile.heightCm.trim().length > 0 &&
    profile.gender !== null &&
    profile.build !== null &&
    profile.location.trim().length > 0 &&
    profile.employment !== null

  return (
    <OnboardingScreenShell
      step={2}
      totalSteps={5}
      title="Tell us some basic info about yourself."
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push("/onboarding/interests" as Href)}
        />
      }
    >
      <View className="gap-6">
        <TextField
          label="Birthdate"
          value={profile.birthdate}
          onChangeText={(value) => update("birthdate", value)}
          placeholder="DD/MM/YYYY"
          keyboardType="number-pad"
          maxLength={10}
        />

        <TextField
          label="Height (cm)"
          value={profile.heightCm}
          onChangeText={(value) =>
            update("heightCm", value.replace(/[^0-9]/g, ""))
          }
          placeholder="e.g. 175"
          keyboardType="number-pad"
          maxLength={3}
        />

        <FieldRow label="Gender">
          <ChipGroup>
            {GENDER_OPTIONS.map((g) => (
              <Chip
                key={g}
                label={g}
                selected={profile.gender === g}
                onPress={() => update("gender", g)}
              />
            ))}
          </ChipGroup>
        </FieldRow>

        <FieldRow label="Build">
          <ChipGroup>
            {BUILD_OPTIONS.map((b) => (
              <Chip
                key={b}
                label={b}
                selected={profile.build === b}
                onPress={() => update("build", b)}
              />
            ))}
          </ChipGroup>
        </FieldRow>

        <TextField
          label="Current location"
          value={profile.location}
          onChangeText={(value) => update("location", value)}
          placeholder="City, country"
          autoCapitalize="words"
        />

        <FieldRow label="Are you working or studying?">
          <ChipGroup>
            {EMPLOYMENT_OPTIONS.map((e) => (
              <Chip
                key={e}
                label={e}
                selected={profile.employment === e}
                onPress={() => update("employment", e)}
              />
            ))}
          </ChipGroup>
        </FieldRow>
      </View>
    </OnboardingScreenShell>
  )
}
