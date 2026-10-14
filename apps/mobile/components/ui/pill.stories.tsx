import type { Meta, StoryObj } from "@storybook/react-native"
import { X } from "lucide-react-native"
import { fn } from "storybook/test"

import { Pill } from "./pill"
import { Icons } from "@/lib/icons"

const meta = {
  title: "UI/Pill",
  component: Pill,
  args: {
    label: "Activity type",
    active: false,
    size: "md",
    onPress: fn(),
  },
  argTypes: {
    label: { control: "text" },
    active: { control: "boolean" },
    size: { control: "radio", options: ["sm", "md"] },
  },
} satisfies Meta<typeof Pill>

export default meta

type Story = StoryObj<typeof meta>

export const Inactive: Story = {}

export const Active: Story = {
  args: { active: true },
}

export const WithIcons: Story = {
  args: {
    label: "Music",
    size: "sm",
    active: true,
    leadingIcon: Icons.Guitar,
    trailingIcon: X,
  },
}
