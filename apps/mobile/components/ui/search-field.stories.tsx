import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-native"
import { fn } from "storybook/test"

import { SearchField } from "./search-field"

const meta = {
  title: "UI/SearchField",
  component: SearchField,
  args: {
    label: "Search activities",
    value: "",
    onChangeText: fn(),
  },
  argTypes: {
    value: { control: "text" },
  },
} satisfies Meta<typeof SearchField>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const WithQuery: Story = {
  args: { value: "guitar" },
}

function InteractiveSearchField() {
  const [value, setValue] = useState("")
  return <SearchField label="Search activities" value={value} onChangeText={setValue} />
}

export const Interactive: Story = {
  render: () => <InteractiveSearchField />,
}
