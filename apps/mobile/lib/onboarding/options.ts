import { DEFAULT_BFAS_SCORES } from "@touchgrass/types/constants"

import type {
  Build,
  EmploymentStatus,
  Gender,
  OnboardingFormValues,
} from "./types"

export const ONBOARDING_DEFAULT_VALUES: OnboardingFormValues = {
  name: "",
  birthdate: "",
  heightCm: "",
  gender: null,
  build: null,
  location: "",
  employment: null,
  interests: [],
  personality: { ...DEFAULT_BFAS_SCORES },
  motivations: [],
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
