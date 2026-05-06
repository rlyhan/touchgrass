import {
  BUILDS,
  DEFAULT_BFAS_SCORES,
  EMPLOYMENT_STATUSES,
  GENDERS,
} from "@touchgrass/types/constants"

import type { OnboardingFormValues } from "./types"

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

export const GENDER_OPTIONS = GENDERS
export const BUILD_OPTIONS = BUILDS
export const EMPLOYMENT_OPTIONS = EMPLOYMENT_STATUSES
