export type ActivityType =
  | "Constructive"
  | "Active"
  | "Artistic"
  | "Intellectual"
  | "Outdoorsy"
  | "Social"
  | "Reflective"
  | "Creative"
  | "Adventurous"
  | "Professional"

export type ActivityField =
  | "Music"
  | "Martial Arts"
  | "Literature"
  | "Cooking"
  | "Photography"
  | "Gaming"
  | "Fitness"
  | "Coding"
  | "Science"
  | "Nature"
  | "Film"
  | "Theater"
  | "Visual Art"
  | "Writing"
  | "Dance"
  | "Cycling"
  | "Hiking"
  | "Travel"
  | "Wellness"
  | "Astronomy"

export const ACTIVITY_TYPES: ActivityType[] = [
  "Constructive",
  "Active",
  "Artistic",
  "Intellectual",
  "Outdoorsy",
  "Social",
  "Reflective",
  "Creative",
  "Adventurous",
  "Professional",
]

export const ACTIVITY_FIELDS: ActivityField[] = [
  "Music",
  "Martial Arts",
  "Literature",
  "Cooking",
  "Photography",
  "Gaming",
  "Fitness",
  "Coding",
  "Science",
  "Nature",
  "Film",
  "Theater",
  "Visual Art",
  "Writing",
  "Dance",
  "Cycling",
  "Hiking",
  "Travel",
  "Wellness",
  "Astronomy",
]

// Big Five personality model (OCEAN). Each trait is a 0-100 score.
export type PersonalityType =
  | "Openness"
  | "Conscientiousness"
  | "Extraversion"
  | "Agreeableness"
  | "Neuroticism"

export type PersonalityScores = Record<PersonalityType, number>

export type PersonalityTrait = {
  key: PersonalityType
  label: string
  description: string
  lowLabel: string
  highLabel: string
}

export const PERSONALITY_TRAITS: PersonalityTrait[] = [
  {
    key: "Openness",
    label: "Openness",
    description:
      "How much you enjoy new ideas, abstract thinking, and unfamiliar experiences.",
    lowLabel: "Practical",
    highLabel: "Curious",
  },
  {
    key: "Conscientiousness",
    label: "Conscientiousness",
    description:
      "How structured and goal-driven you are versus flexible and spontaneous.",
    lowLabel: "Spontaneous",
    highLabel: "Disciplined",
  },
  {
    key: "Extraversion",
    label: "Extraversion",
    description:
      "How energised you feel around other people compared to time alone.",
    lowLabel: "Reserved",
    highLabel: "Outgoing",
  },
  {
    key: "Agreeableness",
    label: "Agreeableness",
    description:
      "How much you prioritise harmony and cooperation versus directness and competition.",
    lowLabel: "Direct",
    highLabel: "Cooperative",
  },
  {
    key: "Neuroticism",
    label: "Neuroticism",
    description:
      "How strongly you experience stress and emotional ups and downs.",
    lowLabel: "Calm",
    highLabel: "Sensitive",
  },
]

export const DEFAULT_PERSONALITY_SCORES: PersonalityScores = {
  Openness: 50,
  Conscientiousness: 50,
  Extraversion: 50,
  Agreeableness: 50,
  Neuroticism: 50,
}
