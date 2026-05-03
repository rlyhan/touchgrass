import type { Meta, StoryObj } from "@storybook/react-native"
import { fn } from "storybook/test"

import { PrimaryButton } from "./primary-button"

const meta = {
  title: "UI/PrimaryButton",
  component: PrimaryButton,
  args: {
    label: "Continue",
    disabled: false,
    onPress: fn(),
  },
  argTypes: {
    label: { control: "text" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof PrimaryButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: { disabled: true },
}