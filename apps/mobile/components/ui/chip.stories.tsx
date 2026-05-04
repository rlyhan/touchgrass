import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-native"
import { fn } from "storybook/test"

import { Chip, ChipGroup } from "./chip"
import { Icons } from "@/lib/icons"

const meta = {
  title: "UI/Chip",
  component: Chip,
  args: {
    label: "Hiking",
    selected: false,
    onPress: fn(),
  },
  argTypes: {
    label: { control: "text" },
    selected: { control: "boolean" },
  },
} satisfies Meta<typeof Chip>

export default meta

type Story = StoryObj<typeof meta>

export const Unselected: Story = {}

export const Selected: Story = {
  args: { selected: true },
}

export const WithIcon: Story = {
  args: {
    label: "Music",
    icon: Icons.Guitar,
  },
}

export const WithIconSelected: Story = {
  args: {
    label: "Music",
    icon: Icons.Guitar,
    selected: true,
  },
}

function ChipGroupExample() {
  const items: { label: string; icon: typeof Icons.Guitar }[] = [
    { label: "Music", icon: Icons.Guitar },
    { label: "Cooking", icon: Icons.ChefHat },
    { label: "Hiking", icon: Icons.Mountain },
    { label: "Photography", icon: Icons.Camera },
    { label: "Reading", icon: Icons.BookOpen },
    { label: "Coding", icon: Icons.Code },
  ]
  const [selected, setSelected] = useState<string[]>(["Music", "Hiking"])
  const toggle = (label: string) =>
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    )

  return (
    <ChipGroup>
      {items.map(({ label, icon }) => (
        <Chip
          key={label}
          label={label}
          icon={icon}
          selected={selected.includes(label)}
          onPress={() => toggle(label)}
        />
      ))}
    </ChipGroup>
  )
}

export const Group: Story = {
  render: () => <ChipGroupExample />,
}
