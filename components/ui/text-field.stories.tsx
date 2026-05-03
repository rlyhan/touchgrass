import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-native"

import { TextField } from "./text-field"

function ControlledTextField(args: React.ComponentProps<typeof TextField>) {
  const [value, setValue] = useState("")
  return <TextField {...args} value={value} onChangeText={setValue} />
}

const meta = {
  title: "UI/TextField",
  component: TextField,
  args: {
    label: "Name",
    placeholder: "Enter your name",
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
  },
  render: (args) => <ControlledTextField {...args} />,
} satisfies Meta<typeof TextField>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Email: Story = {
  args: {
    label: "Email",
    placeholder: "you@example.com",
    keyboardType: "email-address",
    autoCapitalize: "none",
  },
}

export const Numeric: Story = {
  args: {
    label: "Age",
    placeholder: "0",
    keyboardType: "number-pad",
  },
}
