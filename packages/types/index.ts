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

// Big Five Aspects Scale (BFAS) — 10 aspects, two per Big Five domain.
export type BFASTrait =
  | "Openness"
  | "Intellect"
  | "Industriousness"
  | "Orderliness"
  | "Enthusiasm"
  | "Assertiveness"
  | "Compassion"
  | "Politeness"
  | "Volatility"
  | "Withdrawal"

export type BFASScores = Record<BFASTrait, number>

export type BFASTraitDefinition = {
  key: BFASTrait
  label: string
  description: string
  lowLabel: string
  highLabel: string
  parent: PersonalityType
}

export const BFAS_TRAITS: BFASTraitDefinition[] = [
  {
    key: "Openness",
    label: "Openness",
    description: "How much you seek out novel experiences, art, and sensory beauty.",
    lowLabel: "Conventional",
    highLabel: "Imaginative",
    parent: "Openness",
  },
  {
    key: "Intellect",
    label: "Intellect",
    description: "How drawn you are to abstract ideas, puzzles, and intellectual debate.",
    lowLabel: "Concrete",
    highLabel: "Analytical",
    parent: "Openness",
  },
  {
    key: "Industriousness",
    label: "Industriousness",
    description: "How hard-working and persistent you are when pursuing goals.",
    lowLabel: "Easygoing",
    highLabel: "Driven",
    parent: "Conscientiousness",
  },
  {
    key: "Orderliness",
    label: "Orderliness",
    description: "How much you prefer structure, routine, and keeping things tidy.",
    lowLabel: "Flexible",
    highLabel: "Organised",
    parent: "Conscientiousness",
  },
  {
    key: "Enthusiasm",
    label: "Enthusiasm",
    description: "How exuberant, talkative, and positive you are around others.",
    lowLabel: "Quiet",
    highLabel: "Enthusiastic",
    parent: "Extraversion",
  },
  {
    key: "Assertiveness",
    label: "Assertiveness",
    description: "How confidently you take charge, speak up, and lead.",
    lowLabel: "Compliant",
    highLabel: "Assertive",
    parent: "Extraversion",
  },
  {
    key: "Compassion",
    label: "Compassion",
    description: "How empathetic and caring you are towards others' feelings.",
    lowLabel: "Detached",
    highLabel: "Empathetic",
    parent: "Agreeableness",
  },
  {
    key: "Politeness",
    label: "Politeness",
    description: "How much you defer to others, avoid conflict, and follow social norms.",
    lowLabel: "Blunt",
    highLabel: "Considerate",
    parent: "Agreeableness",
  },
  {
    key: "Volatility",
    label: "Volatility",
    description: "How quickly your mood shifts and how intensely you react to stress.",
    lowLabel: "Even-keeled",
    highLabel: "Reactive",
    parent: "Neuroticism",
  },
  {
    key: "Withdrawal",
    label: "Withdrawal",
    description: "How prone you are to anxiety, self-doubt, and pulling away from others.",
    lowLabel: "Confident",
    highLabel: "Withdrawn",
    parent: "Neuroticism",
  },
]

export const DEFAULT_BFAS_SCORES: BFASScores = {
  Openness: 50,
  Intellect: 50,
  Industriousness: 50,
  Orderliness: 50,
  Enthusiasm: 50,
  Assertiveness: 50,
  Compassion: 50,
  Politeness: 50,
  Volatility: 50,
  Withdrawal: 50,
}
