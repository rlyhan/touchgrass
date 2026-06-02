import type { Meta, StoryObj } from "@storybook/react-native"

import type { UserPatternWeights } from "@touchgrass/types"
import { PATTERN_TYPES } from "@touchgrass/types/constants"

import { TopPatternsSection } from "./top-patterns-section"

function makeWeights(
  overrides: Partial<UserPatternWeights>,
): UserPatternWeights {
  const base: Partial<UserPatternWeights> = {}
  for (const p of PATTERN_TYPES) base[p.id] = 0.1
  return { ...base, ...overrides } as UserPatternWeights
}

const meta = {
  title: "Patterns/TopPatternsSection",
  component: TopPatternsSection,
  args: {
    patternWeights: makeWeights({
      "4-HH": 0.95, // Enchanting Visionary
      "9-HH": 0.85, // Enlightened Traditionalist
      "1-HH": 0.75, // Personable
    }),
  },
} satisfies Meta<typeof TopPatternsSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CloseMatches: Story = {
  args: {
    patternWeights: makeWeights({
      "2-HH": 0.62, // Enterprising
      "3-HH": 0.6, // Inquisitive-Achiever
      "5-HH": 0.58, // Compassionate-Idealist
    }),
  },
}

export const LowConfidence: Story = {
  args: {
    patternWeights: makeWeights({
      "1-LL": 0.22, // Independent-Distant
      "7-LL": 0.2, // tied lower group
      "10-LL": 0.18,
    }),
  },
}
