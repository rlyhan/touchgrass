import { type ReactNode } from "react"
import { FormProvider, useForm, useFormContext } from "react-hook-form"

import { ONBOARDING_DEFAULT_VALUES } from "./options"
import type { OnboardingFormValues } from "./types"

type Props = {
  children: ReactNode
  defaultValues?: OnboardingFormValues
}

export function OnboardingProvider({ children, defaultValues = ONBOARDING_DEFAULT_VALUES }: Props) {
  const form = useForm<OnboardingFormValues>({
    mode: "onChange",
    defaultValues,
  })

  return <FormProvider {...form}>{children}</FormProvider>
}

export function useOnboardingForm() {
  return useFormContext<OnboardingFormValues>()
}
