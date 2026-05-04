import type { Meta, StoryObj } from "@storybook/react-native"
import { fn } from "storybook/test"

import { SkipButton } from "./skip-button"

const meta = {
  title: "Onboarding/SkipButton",
  component: SkipButton,
  args: {
    onPress: fn(),
  },
} satisfies Meta<typeof SkipButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
