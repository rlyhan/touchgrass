import type { ActivityField, BFASScores } from "@touchgrass/types"

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
  personality: BFASScores
  motivations: string[]
}
