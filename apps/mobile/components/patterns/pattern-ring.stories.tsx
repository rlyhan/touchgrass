import { View } from "react-native"
import type { Meta, StoryObj } from "@storybook/react-native"

import { PatternRing } from "./pattern-ring"

const meta = {
  title: "Patterns/PatternRing",
  component: PatternRing,
  args: {
    percent: 78,
    label: "Personable",
    isSelected: false,
    anySelected: false,
  },
  argTypes: {
    percent: { control: { type: "range", min: 0, max: 100, step: 1 } },
    label: { control: "text" },
    duration: { control: { type: "range", min: 0, max: 2000, step: 50 } },
    isSelected: { control: "boolean" },
    anySelected: { control: "boolean" },
  },
} satisfies Meta<typeof PatternRing>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = {
  args: { isSelected: true, anySelected: true },
}

export const Dimmed: Story = {
  args: { isSelected: false, anySelected: true },
}

export const HighMatch: Story = {
  args: { percent: 95, label: "Enchanting Visionary" },
}

export const LowMatch: Story = {
  args: { percent: 12, label: "Independent-Distant" },
}

export const Row: Story = {
  render: () => (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 32 }}>
      <PatternRing percent={95} label="Enchanting Visionary" anySelected />
      <PatternRing
        percent={85}
        label="Enlightened Traditionalist"
        isSelected
        anySelected
      />
      <PatternRing percent={75} label="Personable" anySelected />
    </View>
  ),
}
