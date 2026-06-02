import type { Meta, StoryObj } from "@storybook/react-native"

import { PatternMatchAccordion } from "./pattern-match-accordion"

const meta = {
  title: "Patterns/PatternMatchAccordion",
  component: PatternMatchAccordion,
  args: {
    patternName: "Personable",
    shortDescription: "Warm, engaging, and naturally people-oriented.",
  },
  argTypes: {
    patternName: { control: "text" },
    shortDescription: { control: "text" },
  },
} satisfies Meta<typeof PatternMatchAccordion>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Visionary: Story = {
  args: {
    patternName: "Enchanting Visionary",
    shortDescription:
      "Imaginative, expressive, and drawn to novel ideas and aesthetics.",
  },
}

export const LongDescription: Story = {
  args: {
    patternName: "Enlightened Traditionalist",
    shortDescription:
      "Grounded, principled, and reflective. You value time-tested approaches " +
      "while staying open to insight, blending steadiness with a thoughtful " +
      "curiosity about how things came to be the way they are.",
  },
}
