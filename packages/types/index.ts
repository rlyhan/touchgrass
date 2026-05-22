import type { PortableTextBlock } from "@portabletext/types"

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

export type OCEANScores = Record<PersonalityType, number>

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

export type Motivation = {
  value: string
  label: string
  associated_activity_types: ActivityType[]
}

export type TraitLevel = 'H' | 'L';

export type PatternTypeId =
  | '1-HH' | '1-HL' | '1-LH' | '1-LL'
  | '2-HH' | '2-HL' | '2-LH' | '2-LL'
  | '3-HH' | '3-HL' | '3-LH' | '3-LL'
  | '4-HH' | '4-HL' | '4-LH' | '4-LL'
  | '5-HH' | '5-HL' | '5-LH' | '5-LL'
  | '6-HH' | '6-HL' | '6-LH' | '6-LL'
  | '7-HH' | '7-HL' | '7-LH' | '7-LL'
  | '8-HH' | '8-HL' | '8-LH' | '8-LL'
  | '9-HH' | '9-HL' | '9-LH' | '9-LL'
  | '10-HH' | '10-HL' | '10-LH' | '10-LL';

export interface PatternGroup {
  id: number;
  label: string;
  traitA: PersonalityType;
  traitB: PersonalityType;
}

export interface PatternType {
  id: PatternTypeId;
  groupId: number;
  name: string;
  shortDescription: string;
  traitA: {
    trait: PersonalityType;
    level: TraitLevel;
  };
  traitB: {
    trait: PersonalityType;
    level: TraitLevel;
  };
}

export type ActivityInstruction = {
  title: string
  description?: string
}

export type ActivityTip = {
  key: string
  description: string
}

export type Activity = {
  slug: string
  title: string
  imageUrl: string
  type: ActivityType
  field: ActivityField
  estimated_time: string
  related_types?: ActivityType[]
  description?: PortableTextBlock[]
  tips?: ActivityTip[]
  instructions?: ActivityInstruction[]
}

export type ScoredRecommendation = {
  rec: Activity
  score: number
}

export type ScoredActivityType = {
  type: ActivityType
  score: number
}
