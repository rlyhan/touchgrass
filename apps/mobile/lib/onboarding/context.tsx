import { type ReactNode } from "react"
import { FormProvider, useForm, useFormContext } from "react-hook-form"

import { ONBOARDING_DEFAULT_VALUES } from "./options"
import type { OnboardingFormValues } from "./types"

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const form = useForm<OnboardingFormValues>({
    mode: "onChange",
    defaultValues: ONBOARDING_DEFAULT_VALUES,
  })

  return <FormProvider {...form}>{children}</FormProvider>
}

export function useOnboardingForm() {
  return useFormContext<OnboardingFormValues>()
}
