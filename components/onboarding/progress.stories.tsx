import type { Meta, StoryObj } from "@storybook/react-native"

import { OnboardingProgress } from "./progress"

const meta = {
  title: "Onboarding/Progress",
  component: OnboardingProgress,
  args: {
    step: 2,
    totalSteps: 5,
  },
  argTypes: {
    step: { control: { type: "range", min: 0, max: 10, step: 1 } },
    totalSteps: { control: { type: "range", min: 1, max: 10, step: 1 } },
  },
} satisfies Meta<typeof OnboardingProgress>

export default meta

type Story = StoryObj<typeof meta>

export const Start: Story = {
  args: { step: 0, totalSteps: 5 },
}

export const Midway: Story = {
  args: { step: 3, totalSteps: 5 },
}

export const Complete: Story = {
  args: { step: 5, totalSteps: 5 },
}
