import type { Href } from "expo-router"
import type { ReactNode } from "react"
import { Controller } from "react-hook-form"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { Chip, ChipGroup } from "@/components/ui/chip"
import { getFieldIcon } from "@/lib/icons"
import { useOnboardingForm } from "@/lib/onboarding/context"
import { toggleItem } from "@/lib/toggle-item"
import { ACTIVITY_FIELDS } from "@touchgrass/types/constants"

type Props = {
  step: number
  totalSteps: number
  backHref: Href
  footer: ReactNode
}

export function InterestsStep({ step, totalSteps, backHref, footer }: Props) {
  const { control } = useOnboardingForm()

  return (
    <OnboardingScreenShell
      step={step}
      totalSteps={totalSteps}
      backHref={backHref}
      title="Pick a few things you're interested in."
      subtitle="Don't worry if you can't think of anything right now."
      footer={footer}
    >
      <Controller
        control={control}
        name="interests"
        render={({ field: { value, onChange } }) => (
          <ChipGroup>
            {ACTIVITY_FIELDS.map((field) => (
              <Chip
                key={field}
                label={field}
                icon={getFieldIcon(field)}
                selected={value.includes(field)}
                onPress={() => onChange(toggleItem(value, field))}
              />
            ))}
          </ChipGroup>
        )}
      />
    </OnboardingScreenShell>
  )
}
