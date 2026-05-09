import type { Motivation } from "@touchgrass/types"
import {
  BUILDS,
  DEFAULT_BFAS_SCORES,
  EMPLOYMENT_STATUSES,
  GENDERS,
} from "@touchgrass/types/constants"

import type { OnboardingFormValues } from "./types"

export const ONBOARDING_DEFAULT_VALUES: OnboardingFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
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

export const MOTIVATION_OPTIONS: Motivation[] = [
  // Creative / Expressive
  {
    value: "explore_creative",
    label: "Explore my creative side",
    associated_activity_types: [
      "Creative",
      "Artistic",
      "Constructive",
      "Expressive",
      "Performative",
    ],
  },

  // Intellectual / Reflective
  {
    value: "learn_think_grow",
    label: "Learn, think, and expand my mind",
    associated_activity_types: [
      "Intellectual",
      "Analytical",
      "Educational",
      "Reflective",
    ],
  },

  // Active / Competitive
  {
    value: "challenge_push_myself",
    label: "Challenge and push myself",
    associated_activity_types: [
      "Active",
      "Physical",
      "Skill-based",
      "Competitive",
    ],
  },

  // Exploratory / Adventurous
  {
    value: "seek_adventure",
    label: "Explore new experiences and adventure",
    associated_activity_types: [
      "Adventurous",
      "Outdoorsy",
      "Exploratory",
      "Experimental",
    ],
  },

  // Social / Community
  {
    value: "connect_with_people",
    label: "Connect with people and share experiences",
    associated_activity_types: [
      "Social",
      "Collaborative",
      "Leadership",
      "Community-oriented",
    ],
  },

  // Professional / Goal-oriented
  {
    value: "grow_and_achieve",
    label: "Work toward goals and personal growth",
    associated_activity_types: [
      "Professional",
      "Goal-oriented",
      "Disciplined",
      "Strategic",
    ],
  },

  // Emotional / Therapeutic
  {
    value: "improve_wellbeing",
    label: "Feel calmer, healthier, or emotionally balanced",
    associated_activity_types: [
      "Mindful",
      "Therapeutic",
      "Emotional",
    ],
  },
]

export const GENDER_OPTIONS = GENDERS
export const BUILD_OPTIONS = BUILDS
export const EMPLOYMENT_OPTIONS = EMPLOYMENT_STATUSES
