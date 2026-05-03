import type { Meta, StoryObj } from "@storybook/react-native"
import { Text, View } from "react-native"

import { FieldRow } from "./field-row"

const placeholderChild = (
  <View className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
    <Text className="text-base text-gray-900">Field content goes here</Text>
  </View>
)

const meta = {
  title: "UI/FieldRow",
  component: FieldRow,
  args: {
    label: "Preferred name",
    children: placeholderChild,
  },
  argTypes: {
    label: { control: "text" },
  },
} satisfies Meta<typeof FieldRow>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}