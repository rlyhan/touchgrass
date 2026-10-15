import type { Meta, StoryObj } from "@storybook/react-native"
import { fn } from "storybook/test"

import { FilterOption } from "./filter-option"
import { Icons } from "@/lib/icons"

const meta = {
  title: "Browse/FilterOption",
  component: FilterOption,
  args: {
    label: "Music",
    icon: Icons.Guitar,
    selected: false,
    onToggle: fn(),
  },
  argTypes: {
    label: { control: "text" },
    selected: { control: "boolean" },
  },
} satisfies Meta<typeof FilterOption>

export default meta

type Story = StoryObj<typeof meta>

export const Unselected: Story = {}

export const Selected: Story = {
  args: { selected: true },
}
