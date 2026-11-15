import { View } from "react-native"
import type { Meta, StoryObj } from "@storybook/react-native"

import { PATTERN_COLORS } from "@/lib/theme/pattern-colors"

import { PatternIcon } from "./pattern-icon"

const meta = {
  title: "Icons/PatternIcon",
  component: PatternIcon,
  args: {
    color: PATTERN_COLORS["4-LH"],
    size: 48,
    strokeWidth: 1.7,
  },
  argTypes: {
    color: { control: "color" },
    size: { control: { type: "range", min: 12, max: 96, step: 4 } },
    strokeWidth: { control: { type: "range", min: 0.5, max: 4, step: 0.1 } },
  },
} satisfies Meta<typeof PatternIcon>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AllPatternColors: Story = {
  render: () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
      {Object.entries(PATTERN_COLORS).map(([id, color]) => (
        <PatternIcon key={id} color={color} size={32} />
      ))}
    </View>
  ),
}
