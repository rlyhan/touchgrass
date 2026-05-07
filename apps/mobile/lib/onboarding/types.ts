import type {
  ActivityField,
  BFASScores,
  Build,
  EmploymentStatus,
  Gender,
} from "@touchgrass/types"

export type { Build, EmploymentStatus, Gender }

export type OnboardingFormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
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
