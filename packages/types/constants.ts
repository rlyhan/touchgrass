import type {
  ActivityField,
  ActivityType,
  BFASScores,
  BFASTraitDefinition,
  Build,
  EmploymentStatus,
  Gender,
  Motivation,
  PatternGroup,
  PatternType,
  PatternTypeId,
  PersonalityScores,
  PersonalityTrait,
  PersonalityType,
} from "./index.js"

export const GENDERS: Gender[] = [
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to say",
]

export const BUILDS: Build[] = ["Slim", "Athletic", "Average", "Heavy"]

export const EMPLOYMENT_STATUSES: EmploymentStatus[] = [
  "Student",
  "Employed",
  "Unemployed",
  "Retired",
]

export const ACTIVITY_TYPES: ActivityType[] = [
  "Creative",
  "Artistic",
  "Constructive",
  "Expressive",
  "Performative",

  "Intellectual",
  "Analytical",
  "Educational",
  "Reflective",

  "Active",
  "Physical",
  "Skill-based",
  "Competitive",

  "Adventurous",
  "Outdoorsy",
  "Exploratory",
  "Experimental",

  "Social",
  "Collaborative",
  "Leadership",
  "Community-oriented",

  "Professional",
  "Goal-oriented",
  "Disciplined",
  "Strategic",

  "Mindful",
  "Therapeutic",
  "Emotional",
]

export const ACTIVITY_TYPE_OPTIONS: { title: string; value: ActivityType }[] = ACTIVITY_TYPES.map(
  (value) => ({ title: value, value }),
)

export const ACTIVITY_FIELDS: ActivityField[] = [
  "Music",
  "Art",
  "Writing",
  "Photography",
  "Film",
  "Theater",
  "Dance",

  "Coding",
  "Technology",
  "Science",
  "Astronomy",
  "Engineering",

  "Cars",
  "Motorcycles",
  "Aviation",

  "Fitness",
  "Sports",
  "Martial Arts",
  "Cycling",
  "Running",
  "Climbing",
  "Hiking",

  "Gaming",
  "Board Games",

  "Cooking",
  "Coffee",
  "Fashion",

  "Travel",
  "Nature",
  "Camping",

  "Psychology",
  "Philosophy",
  "History",
  "Language",

  "Business",
  "Finance",
  "Leadership",

  "Meditation",
  "Wellness",

  "Education",
  "Community",
  "Volunteering",

  "DIY",
  "Home Design",
  "Collecting",
]

export const ACTIVITY_FIELD_OPTIONS: { title: string; value: ActivityField }[] = ACTIVITY_FIELDS.map(
  (value) => ({ title: value, value }),
)

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

const PERSONALITY_TRAIT_BY_KEY = Object.fromEntries(
  PERSONALITY_TRAITS.map((trait) => [trait.key, trait]),
) as Record<PersonalityType, PersonalityTrait>

export const BFAS_TRAITS: BFASTraitDefinition[] = [
  {
    key: "Openness",
    label: "Openness",
    description: "How much you seek out novel experiences, art, and sensory beauty.",
    lowLabel: "Conventional",
    highLabel: "Imaginative",
    parent: PERSONALITY_TRAIT_BY_KEY.Openness,
  },
  {
    key: "Intellect",
    label: "Intellect",
    description: "How drawn you are to abstract ideas, puzzles, and intellectual debate.",
    lowLabel: "Concrete",
    highLabel: "Analytical",
    parent: PERSONALITY_TRAIT_BY_KEY.Openness,
  },
  {
    key: "Industriousness",
    label: "Industriousness",
    description: "How hard-working and persistent you are when pursuing goals.",
    lowLabel: "Easygoing",
    highLabel: "Driven",
    parent: PERSONALITY_TRAIT_BY_KEY.Conscientiousness,
  },
  {
    key: "Orderliness",
    label: "Orderliness",
    description: "How much you prefer structure, routine, and keeping things tidy.",
    lowLabel: "Flexible",
    highLabel: "Organised",
    parent: PERSONALITY_TRAIT_BY_KEY.Conscientiousness,
  },
  {
    key: "Enthusiasm",
    label: "Enthusiasm",
    description: "How exuberant, talkative, and positive you are around others.",
    lowLabel: "Quiet",
    highLabel: "Enthusiastic",
    parent: PERSONALITY_TRAIT_BY_KEY.Extraversion,
  },
  {
    key: "Assertiveness",
    label: "Assertiveness",
    description: "How confidently you take charge, speak up, and lead.",
    lowLabel: "Compliant",
    highLabel: "Assertive",
    parent: PERSONALITY_TRAIT_BY_KEY.Extraversion,
  },
  {
    key: "Compassion",
    label: "Compassion",
    description: "How empathetic and caring you are towards others' feelings.",
    lowLabel: "Detached",
    highLabel: "Empathetic",
    parent: PERSONALITY_TRAIT_BY_KEY.Agreeableness,
  },
  {
    key: "Politeness",
    label: "Politeness",
    description: "How much you defer to others, avoid conflict, and follow social norms.",
    lowLabel: "Blunt",
    highLabel: "Considerate",
    parent: PERSONALITY_TRAIT_BY_KEY.Agreeableness,
  },
  {
    key: "Volatility",
    label: "Volatility",
    description: "How quickly your mood shifts and how intensely you react to stress.",
    lowLabel: "Even-keeled",
    highLabel: "Reactive",
    parent: PERSONALITY_TRAIT_BY_KEY.Neuroticism,
  },
  {
    key: "Withdrawal",
    label: "Withdrawal",
    description: "How prone you are to anxiety, self-doubt, and pulling away from others.",
    lowLabel: "Confident",
    highLabel: "Withdrawn",
    parent: PERSONALITY_TRAIT_BY_KEY.Neuroticism,
  },
]

export const BFAS_PARENT_LABELS: Record<PersonalityType, string> = {
  Openness: "Openness to Experience",
  Conscientiousness: "Conscientiousness",
  Extraversion: "Extraversion",
  Agreeableness: "Agreeableness",
  Neuroticism: "Neuroticism",
}

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

export const patternGroups: PatternGroup[] = [
  {
    id: 1,
    label: 'Extraversion × Agreeableness',
    traitA: 'Extraversion',
    traitB: 'Agreeableness',
  },
  {
    id: 2,
    label: 'Extraversion × Conscientiousness',
    traitA: 'Extraversion',
    traitB: 'Conscientiousness',
  },
  {
    id: 3,
    label: 'Extraversion × Neuroticism',
    traitA: 'Extraversion',
    traitB: 'Neuroticism',
  },
  {
    id: 4,
    label: 'Extraversion × Openness',
    traitA: 'Extraversion',
    traitB: 'Openness',
  },
  {
    id: 5,
    label: 'Agreeableness × Conscientiousness',
    traitA: 'Agreeableness',
    traitB: 'Conscientiousness',
  },
  {
    id: 6,
    label: 'Agreeableness × Neuroticism',
    traitA: 'Agreeableness',
    traitB: 'Neuroticism',
  },
  {
    id: 7,
    label: 'Agreeableness × Openness',
    traitA: 'Agreeableness',
    traitB: 'Openness',
  },
  {
    id: 8,
    label: 'Conscientiousness × Neuroticism',
    traitA: 'Conscientiousness',
    traitB: 'Neuroticism',
  },
  {
    id: 9,
    label: 'Conscientiousness × Openness',
    traitA: 'Conscientiousness',
    traitB: 'Openness',
  },
  {
    id: 10,
    label: 'Neuroticism × Openness',
    traitA: 'Neuroticism',
    traitB: 'Openness',
  },
];

export const PATTERN_TYPES: PatternType[] = [
  // Group 1 — Extraversion × Agreeableness
  {
    id: '1-HH',
    groupId: 1,
    name: 'Personable',
    shortDescription: 'Warm, engaging, and naturally people-oriented.',
    traitA: { trait: 'Extraversion', level: 'H' },
    traitB: { trait: 'Agreeableness', level: 'H' },
  },
  {
    id: '1-HL',
    groupId: 1,
    name: 'Assertive-Influencer',
    shortDescription: 'Bold, persuasive, and confidently self-directed.',
    traitA: { trait: 'Extraversion', level: 'H' },
    traitB: { trait: 'Agreeableness', level: 'L' },
  },
  {
    id: '1-LH',
    groupId: 1,
    name: 'Harmonious-Cooperative',
    shortDescription: 'Thoughtful, cooperative, and quietly supportive.',
    traitA: { trait: 'Extraversion', level: 'L' },
    traitB: { trait: 'Agreeableness', level: 'H' },
  },
  {
    id: '1-LL',
    groupId: 1,
    name: 'Independent-Distant',
    shortDescription: 'Independent, self-reliant, and comfortably private.',
    traitA: { trait: 'Extraversion', level: 'L' },
    traitB: { trait: 'Agreeableness', level: 'L' },
  },

  // Group 2 — Extraversion × Conscientiousness
  {
    id: '2-HH',
    groupId: 2,
    name: 'Enterprising',
    shortDescription: 'Energetic, ambitious, and driven to achieve.',
    traitA: { trait: 'Extraversion', level: 'H' },
    traitB: { trait: 'Conscientiousness', level: 'H' },
  },
  {
    id: '2-HL',
    groupId: 2,
    name: 'Spontaneous-Impulsive',
    shortDescription: 'Adventurous, spontaneous, and socially vibrant.',
    traitA: { trait: 'Extraversion', level: 'H' },
    traitB: { trait: 'Conscientiousness', level: 'L' },
  },
  {
    id: '2-LH',
    groupId: 2,
    name: 'Diligent-Industrious',
    shortDescription: 'Dependable, disciplined, and steady in approach.',
    traitA: { trait: 'Extraversion', level: 'L' },
    traitB: { trait: 'Conscientiousness', level: 'H' },
  },
  {
    id: '2-LL',
    groupId: 2,
    name: 'Peaceful Explorer',
    shortDescription: 'Relaxed, adaptable, and free-spirited.',
    traitA: { trait: 'Extraversion', level: 'L' },
    traitB: { trait: 'Conscientiousness', level: 'L' },
  },

  // Group 3 — Extraversion × Neuroticism
  {
    id: '3-HH',
    groupId: 3,
    name: 'Expressive-Energetic',
    shortDescription: 'Expressive, passionate, and emotionally engaged.',
    traitA: { trait: 'Extraversion', level: 'H' },
    traitB: { trait: 'Neuroticism', level: 'H' },
  },
  {
    id: '3-HL',
    groupId: 3,
    name: 'Socially Self-Confident',
    shortDescription: 'Confident, outgoing, and emotionally resilient.',
    traitA: { trait: 'Extraversion', level: 'H' },
    traitB: { trait: 'Neuroticism', level: 'L' },
  },
  {
    id: '3-LH',
    groupId: 3,
    name: 'Reflective Resilient',
    shortDescription: 'Reflective, sensitive, and deeply self-aware.',
    traitA: { trait: 'Extraversion', level: 'L' },
    traitB: { trait: 'Neuroticism', level: 'H' },
  },
  {
    id: '3-LL',
    groupId: 3,
    name: 'Contented',
    shortDescription: 'Calm, grounded, and comfortably independent.',
    traitA: { trait: 'Extraversion', level: 'L' },
    traitB: { trait: 'Neuroticism', level: 'L' },
  },

  // Group 4 — Extraversion × Openness
  {
    id: '4-HH',
    groupId: 4,
    name: 'Enchanting Visionary',
    shortDescription: 'Curious, expressive, and inspired by possibilities.',
    traitA: { trait: 'Extraversion', level: 'H' },
    traitB: { trait: 'Openness', level: 'H' },
  },
  {
    id: '4-HL',
    groupId: 4,
    name: 'Bold Expressive',
    shortDescription: 'Outgoing, practical, and action-oriented.',
    traitA: { trait: 'Extraversion', level: 'H' },
    traitB: { trait: 'Openness', level: 'L' },
  },
  {
    id: '4-LH',
    groupId: 4,
    name: 'Intellectual Explorer',
    shortDescription: 'Imaginative, reflective, and intellectually curious.',
    traitA: { trait: 'Extraversion', level: 'L' },
    traitB: { trait: 'Openness', level: 'H' },
  },
  {
    id: '4-LL',
    groupId: 4,
    name: 'Steady Traditionalist',
    shortDescription: 'Steady, practical, and grounded in reality.',
    traitA: { trait: 'Extraversion', level: 'L' },
    traitB: { trait: 'Openness', level: 'L' },
  },

  // Group 5 — Agreeableness × Conscientiousness
  {
    id: '5-HH',
    groupId: 5,
    name: 'Compromising',
    shortDescription: 'Reliable, cooperative, and genuinely supportive.',
    traitA: { trait: 'Agreeableness', level: 'H' },
    traitB: { trait: 'Conscientiousness', level: 'H' },
  },
  {
    id: '5-HL',
    groupId: 5,
    name: 'Social Harmonizer',
    shortDescription: 'Friendly, easygoing, and socially warm.',
    traitA: { trait: 'Agreeableness', level: 'H' },
    traitB: { trait: 'Conscientiousness', level: 'L' },
  },
  {
    id: '5-LH',
    groupId: 5,
    name: 'Principled Leader',
    shortDescription: 'Principled, disciplined, and standards-driven.',
    traitA: { trait: 'Agreeableness', level: 'L' },
    traitB: { trait: 'Conscientiousness', level: 'H' },
  },
  {
    id: '5-LL',
    groupId: 5,
    name: 'Independent Nonconformist',
    shortDescription: 'Independent, unconventional, and self-directed.',
    traitA: { trait: 'Agreeableness', level: 'L' },
    traitB: { trait: 'Conscientiousness', level: 'L' },
  },

  // Group 6 — Agreeableness × Neuroticism
  {
    id: '6-HH',
    groupId: 6,
    name: 'Passionate Empath',
    shortDescription: 'Empathetic, caring, and emotionally attuned.',
    traitA: { trait: 'Agreeableness', level: 'H' },
    traitB: { trait: 'Neuroticism', level: 'H' },
  },
  {
    id: '6-HL',
    groupId: 6,
    name: 'Pleasant',
    shortDescription: 'Kind, patient, and emotionally balanced.',
    traitA: { trait: 'Agreeableness', level: 'H' },
    traitB: { trait: 'Neuroticism', level: 'L' },
  },
  {
    id: '6-LH',
    groupId: 6,
    name: 'Emotionally Dynamic',
    shortDescription: 'Passionate, strong-willed, and emotionally intense.',
    traitA: { trait: 'Agreeableness', level: 'L' },
    traitB: { trait: 'Neuroticism', level: 'H' },
  },
  {
    id: '6-LL',
    groupId: 6,
    name: 'Stable Realist',
    shortDescription: 'Calm, resilient, and realistically minded.',
    traitA: { trait: 'Agreeableness', level: 'L' },
    traitB: { trait: 'Neuroticism', level: 'L' },
  },

  // Group 7 — Agreeableness × Openness
  {
    id: '7-HH',
    groupId: 7,
    name: 'Tolerant',
    shortDescription: 'Open-minded, compassionate, and imaginative.',
    traitA: { trait: 'Agreeableness', level: 'H' },
    traitB: { trait: 'Openness', level: 'H' },
  },
  {
    id: '7-HL',
    groupId: 7,
    name: 'Amiable Conformist',
    shortDescription: 'Warm, dependable, and community-oriented.',
    traitA: { trait: 'Agreeableness', level: 'H' },
    traitB: { trait: 'Openness', level: 'L' },
  },
  {
    id: '7-LH',
    groupId: 7,
    name: 'Independent Innovator',
    shortDescription: 'Original, independent, and creatively driven.',
    traitA: { trait: 'Agreeableness', level: 'L' },
    traitB: { trait: 'Openness', level: 'H' },
  },
  {
    id: '7-LL',
    groupId: 7,
    name: 'Resolute Practical',
    shortDescription: 'Practical, self-reliant, and clear-minded.',
    traitA: { trait: 'Agreeableness', level: 'L' },
    traitB: { trait: 'Openness', level: 'L' },
  },

  // Group 8 — Conscientiousness × Neuroticism
  {
    id: '8-HH',
    groupId: 8,
    name: 'Meticulous Visionary',
    shortDescription: 'Driven, organized, and highly motivated.',
    traitA: { trait: 'Conscientiousness', level: 'H' },
    traitB: { trait: 'Neuroticism', level: 'H' },
  },
  {
    id: '8-HL',
    groupId: 8,
    name: 'Persistent',
    shortDescription: 'Reliable, disciplined, and emotionally steady.',
    traitA: { trait: 'Conscientiousness', level: 'H' },
    traitB: { trait: 'Neuroticism', level: 'L' },
  },
  {
    id: '8-LH',
    groupId: 8,
    name: 'Creative Nonconformist',
    shortDescription: 'Creative, emotionally expressive, and unconventional.',
    traitA: { trait: 'Conscientiousness', level: 'L' },
    traitB: { trait: 'Neuroticism', level: 'H' },
  },
  {
    id: '8-LL',
    groupId: 8,
    name: 'Easygoing Optimist',
    shortDescription: 'Relaxed, flexible, and easygoing.',
    traitA: { trait: 'Conscientiousness', level: 'L' },
    traitB: { trait: 'Neuroticism', level: 'L' },
  },

  // Group 9 — Conscientiousness × Openness
  {
    id: '9-HH',
    groupId: 9,
    name: 'Enlightened Traditionalist',
    shortDescription: 'Curious, disciplined, and growth-oriented.',
    traitA: { trait: 'Conscientiousness', level: 'H' },
    traitB: { trait: 'Openness', level: 'H' },
  },
  {
    id: '9-HL',
    groupId: 9,
    name: 'Conventional',
    shortDescription: 'Practical, structured, and dependable.',
    traitA: { trait: 'Conscientiousness', level: 'H' },
    traitB: { trait: 'Openness', level: 'L' },
  },
  {
    id: '9-LH',
    groupId: 9,
    name: 'Innovative Idealist',
    shortDescription: 'Imaginative, unconventional, and idea-driven.',
    traitA: { trait: 'Conscientiousness', level: 'L' },
    traitB: { trait: 'Openness', level: 'H' },
  },
  {
    id: '9-LL',
    groupId: 9,
    name: 'Spontaneous Adventurer',
    shortDescription: 'Spontaneous, grounded, and comfort-seeking.',
    traitA: { trait: 'Conscientiousness', level: 'L' },
    traitB: { trait: 'Openness', level: 'L' },
  },

  // Group 10 — Neuroticism × Openness
  {
    id: '10-HH',
    groupId: 10,
    name: 'Sensitive',
    shortDescription: 'Emotionally deep, imaginative, and highly perceptive.',
    traitA: { trait: 'Neuroticism', level: 'H' },
    traitB: { trait: 'Openness', level: 'H' },
  },
  {
    id: '10-HL',
    groupId: 10,
    name: 'Traditionalist',
    shortDescription: 'Cautious, thoughtful, and security-oriented.',
    traitA: { trait: 'Neuroticism', level: 'H' },
    traitB: { trait: 'Openness', level: 'L' },
  },
  {
    id: '10-LH',
    groupId: 10,
    name: 'Clear-Thinking',
    shortDescription: 'Curious, emotionally balanced, and open-minded.',
    traitA: { trait: 'Neuroticism', level: 'L' },
    traitB: { trait: 'Openness', level: 'H' },
  },
  {
    id: '10-LL',
    groupId: 10,
    name: 'Grounded Realist',
    shortDescription: 'Grounded, calm, and practically minded.',
    traitA: { trait: 'Neuroticism', level: 'L' },
    traitB: { trait: 'Openness', level: 'L' },
  },
];

export const ACTIVITY_TYPE_PATTERNS: Record<ActivityType, PatternTypeId[]> = {
  Active: ['2-HH', '3-HL', '1-HL'],
  Adventurous: ['4-HH', '3-HL', '10-LH'],
  Analytical: ['9-HH', '2-LH', '8-HL'],
  Artistic: ['4-HH', '9-LH', '10-HH'],
  Collaborative: ['1-HH', '5-HH', '6-HL'],
  'Community-oriented': ['1-HH', '5-HH', '7-HH'],
  Competitive: ['1-HL', '2-HH', '5-LH'],
  Constructive: ['9-HH', '2-LH', '5-LH'],
  Creative: ['4-HH', '9-HH', '7-LH'],
  Disciplined: ['8-HL', '5-HH', '2-LH'],
  Educational: ['9-HH', '4-LH', '10-LH'],
  Emotional: ['10-HH', '6-HH', '4-LH'],
  Experimental: ['4-HH', '9-LH', '7-LH'],
  Exploratory: ['4-HH', '10-LH', '7-HH'],
  Expressive: ['1-HH', '4-HH', '10-HH'],
  'Goal-oriented': ['2-HH', '8-HL', '9-HH'],
  Intellectual: ['4-LH', '9-HH', '10-LH'],
  Leadership: ['1-HL', '2-HH', '5-LH'],
  Mindful: ['4-LH', '6-HL', '10-LH'],
  Outdoorsy: ['4-HH', '10-LH', '3-HL'],
  Performative: ['1-HL', '1-HH', '3-HL'],
  Physical: ['2-HH', '3-HL', '8-HL'],
  Professional: ['2-HH', '8-HL', '9-HH'],
  Reflective: ['4-LH', '10-HH', '6-HH'],
  'Skill-based': ['2-LH', '8-HL', '9-HH'],
  Social: ['1-HH', '3-HL', '6-HL'],
  Strategic: ['9-HH', '5-LH', '8-HL'],
  Therapeutic: ['6-HH', '10-LH', '4-LH'],
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