import type { Meta, StoryObj } from "@storybook/react-native"

import { GrassLogo } from "./grass-logo"

const meta = {
  title: "Icons/GrassLogo",
  component: GrassLogo,
  argTypes: {
    size: { control: { type: "range", min: 16, max: 256, step: 4 } },
    color: { control: { type: "color" } },
  },
  args: {
    size: 48,
    color: "#10b981",
  },
} satisfies Meta<typeof GrassLogo>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Small: Story = {
  args: { size: 24 },
}

export const Large: Story = {
  args: { size: 128 },
}

export const Slate: Story = {
  args: { color: "#475569" },
}
