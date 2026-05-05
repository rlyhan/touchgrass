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
  parent: PersonalityTrait
}

export type Recommendation = {
  id: string
  title: string
  imageUrl: string
  type: ActivityType
  field: ActivityField
  estimated_time: string
  related_types?: ActivityType[]
}
