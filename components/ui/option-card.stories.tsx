import { useState } from "react"
import { View } from "react-native"
import type { Meta, StoryObj } from "@storybook/react-native"
import { fn } from "storybook/test"

import { OptionCard } from "./option-card"

const meta = {
  title: "UI/OptionCard",
  component: OptionCard,
  args: {
    label: "Mostly indoors",
    selected: false,
    onPress: fn(),
  },
  argTypes: {
    label: { control: "text" },
    selected: { control: "boolean" },
  },
} satisfies Meta<typeof OptionCard>

export default meta

type Story = StoryObj<typeof meta>

export const Unselected: Story = {}

export const Selected: Story = {
  args: { selected: true },
}

function OptionCardGroupExample() {
  const options = ["Mostly indoors", "Mostly outdoors", "A balance of both"]
  const [selected, setSelected] = useState(options[1])
  return (
    <View className="gap-3">
      {options.map((label) => (
        <OptionCard
          key={label}
          label={label}
          selected={selected === label}
          onPress={() => setSelected(label)}
        />
      ))}
    </View>
  )
}

export const Group: Story = {
  render: () => <OptionCardGroupExample />,
}
