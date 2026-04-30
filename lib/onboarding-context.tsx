import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

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

export type OnboardingProfile = {
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

const initialProfile: OnboardingProfile = {
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

type OnboardingContextValue = {
  profile: OnboardingProfile
  update: <K extends keyof OnboardingProfile>(
    key: K,
    value: OnboardingProfile[K],
  ) => void
  reset: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<OnboardingProfile>(initialProfile)

  const value = useMemo<OnboardingContextValue>(
    () => ({
      profile,
      update: (key, val) => setProfile((prev) => ({ ...prev, [key]: val })),
      reset: () => setProfile(initialProfile),
    }),
    [profile],
  )

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) {
    throw new Error("useOnboarding must be used inside OnboardingProvider")
  }
  return ctx
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
