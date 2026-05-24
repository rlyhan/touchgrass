import { router, type Href } from "expo-router"
import { Controller, useWatch } from "react-hook-form"
import { View } from "react-native"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { Chip, ChipGroup } from "@/components/ui/chip"
import { FieldRow } from "@/components/ui/field-row"
import { PrimaryButton } from "@/components/ui/primary-button"
import { TextField } from "@/components/ui/text-field"
import { useOnboardingForm } from "@/lib/onboarding/context"
import {
  BUILD_OPTIONS,
  EMPLOYMENT_OPTIONS,
  GENDER_OPTIONS,
} from "@/lib/onboarding/options"

const BIRTHDATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/

const validateBirthdate = (value: string) =>
  BIRTHDATE_PATTERN.test(value.trim())

const formatBirthdate = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

const validateNonEmpty = (value: string) => value.trim().length > 0

export default function BasicDetailsScreen() {
  const { control } = useOnboardingForm()
  const [birthdate, heightCm, gender, build, location, employment] = useWatch({
    control,
    name: ["birthdate", "heightCm", "gender", "build", "location", "employment"],
  })

  const canContinue =
    validateBirthdate(birthdate) &&
    heightCm.trim().length > 0 &&
    gender !== null &&
    build !== null &&
    location.trim().length > 0 &&
    employment !== null

  return (
    <OnboardingScreenShell
      step={2}
      totalSteps={5}
      backHref="/onboarding/name"
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
        <Controller
          control={control}
          name="birthdate"
          rules={{ required: true, validate: validateBirthdate }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label="Birthdate"
              value={value}
              onChangeText={(v) => onChange(formatBirthdate(v))}
              onBlur={onBlur}
              placeholder="DD/MM/YYYY"
              keyboardType="number-pad"
              maxLength={10}
            />
          )}
        />

        <Controller
          control={control}
          name="heightCm"
          rules={{ required: true, validate: validateNonEmpty }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label="Height (cm)"
              value={value}
              onChangeText={(v) => onChange(v.replace(/[^0-9]/g, ""))}
              onBlur={onBlur}
              placeholder="e.g. 175"
              keyboardType="number-pad"
              maxLength={3}
            />
          )}
        />

        <Controller
          control={control}
          name="gender"
          rules={{ validate: (v) => v !== null }}
          render={({ field: { value, onChange } }) => (
            <FieldRow label="Gender">
              <ChipGroup>
                {GENDER_OPTIONS.map((g) => (
                  <Chip
                    key={g}
                    label={g}
                    selected={value === g}
                    onPress={() => onChange(g)}
                  />
                ))}
              </ChipGroup>
            </FieldRow>
          )}
        />

        <Controller
          control={control}
          name="build"
          rules={{ validate: (v) => v !== null }}
          render={({ field: { value, onChange } }) => (
            <FieldRow label="Build">
              <ChipGroup>
                {BUILD_OPTIONS.map((b) => (
                  <Chip
                    key={b}
                    label={b}
                    selected={value === b}
                    onPress={() => onChange(b)}
                  />
                ))}
              </ChipGroup>
            </FieldRow>
          )}
        />

        <Controller
          control={control}
          name="location"
          rules={{ required: true, validate: validateNonEmpty }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label="Current location"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="City, country"
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={control}
          name="employment"
          rules={{ validate: (v) => v !== null }}
          render={({ field: { value, onChange } }) => (
            <FieldRow label="Are you working or studying?">
              <ChipGroup>
                {EMPLOYMENT_OPTIONS.map((e) => (
                  <Chip
                    key={e}
                    label={e}
                    selected={value === e}
                    onPress={() => onChange(e)}
                  />
                ))}
              </ChipGroup>
            </FieldRow>
          )}
        />
      </View>
    </OnboardingScreenShell>
  )
}
