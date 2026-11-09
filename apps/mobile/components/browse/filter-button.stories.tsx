import type { Meta, StoryObj } from "@storybook/react-native"
import { fn } from "storybook/test"

import { FilterButton } from "./filter-button"

const meta = {
  title: "Browse/FilterButton",
  component: FilterButton,
  args: {
    label: "Activity type",
    open: false,
    onToggle: fn(),
  },
  argTypes: {
    label: { control: "text" },
    open: { control: "boolean" },
  },
} satisfies Meta<typeof FilterButton>

export default meta

type Story = StoryObj<typeof meta>

export const Closed: Story = {}

export const Open: Story = {
  args: { open: true },
}
