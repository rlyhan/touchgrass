import { type ReactNode } from "react"
import { FormProvider, useForm, useFormContext } from "react-hook-form"

import {
  DEFAULT_PERSONALITY_SCORES,
  type ActivityField,
  type PersonalityScores,
} from "@/lib/types"

export type EmploymentStatus = "Student" | "Employed" | "Unemployed" | "Retired"

export type Gender =
  | "Male"
  | "Female"
  | "Non-binary"
  | "Prefer not to say"

export type Build = "Slim" | "Athletic" | "Average" | "Heavy"

export type OnboardingFormValues = {
  name: string
  birthdate: string
  heightCm: string
  gender: Gender | null
  build: Build | null
  location: string
  employment: EmploymentStatus | null
  interests: ActivityField[]
  personality: PersonalityScores
  motivations: string[]
}

export const ONBOARDING_DEFAULT_VALUES: OnboardingFormValues = {
  name: "",
  birthdate: "",
  heightCm: "",
  gender: null,
  build: null,
  location: "",
  employment: null,
  interests: [],
  personality: { ...DEFAULT_PERSONALITY_SCORES },
  motivations: [],
}

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

export const MOTIVATION_OPTIONS = [
  "Something fun and easy to do",
  "A new challenge / goal I can set for myself",
  "Learn some new skills",
  "Meet new people",
  "Self-improvement / well-being"
]

export const GENDER_OPTIONS: Gender[] = [
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to say",
]

export const BUILD_OPTIONS: Build[] = ["Slim", "Athletic", "Average", "Heavy"]

export const EMPLOYMENT_OPTIONS: EmploymentStatus[] = [
  "Student",
  "Employed",
  "Unemployed",
  "Retired",
]
