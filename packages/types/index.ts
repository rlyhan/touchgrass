export type Gender =
  | "Male"
  | "Female"
  | "Non-binary"
  | "Prefer not to say"

export type Build = "Slim" | "Athletic" | "Average" | "Heavy"

export type EmploymentStatus =
  | "Student"
  | "Employed"
  | "Unemployed"
  | "Retired"

export type ActivityType =
  | "Creative"
  | "Artistic"
  | "Constructive"
  | "Expressive"
  | "Performative"

  | "Intellectual"
  | "Analytical"
  | "Educational"
  | "Reflective"

  | "Active"
  | "Physical"
  | "Skill-based"
  | "Competitive"

  | "Adventurous"
  | "Outdoorsy"
  | "Exploratory"
  | "Experimental"

  | "Social"
  | "Collaborative"
  | "Leadership"
  | "Community-oriented"

  | "Professional"
  | "Goal-oriented"
  | "Disciplined"
  | "Strategic"

  | "Mindful"
  | "Therapeutic"
  | "Emotional"

export type ActivityField =
  | "Music"
  | "Art"
  | "Writing"
  | "Photography"
  | "Film"
  | "Theater"
  | "Dance"

  | "Coding"
  | "Technology"
  | "Science"
  | "Astronomy"
  | "Engineering"

  | "Cars"
  | "Motorcycles"
  | "Aviation"

  | "Fitness"
  | "Sports"
  | "Martial Arts"
  | "Cycling"
  | "Running"
  | "Climbing"
  | "Hiking"

  | "Gaming"
  | "Board Games"

  | "Cooking"
  | "Coffee"
  | "Fashion"

  | "Travel"
  | "Nature"
  | "Camping"

  | "Psychology"
  | "Philosophy"
  | "History"
  | "Language"

  | "Business"
  | "Finance"
  | "Leadership"

  | "Meditation"
  | "Wellness"

  | "Education"
  | "Community"
  | "Volunteering"

  | "DIY"
  | "Home Design"
  | "Collecting"

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
