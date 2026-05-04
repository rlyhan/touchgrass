import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-native"
import { fn } from "storybook/test"

import { Slider } from "./slider"

function ControlledSlider({
  value,
  onChange,
  ...args
}: React.ComponentProps<typeof Slider>) {
  const [internal, setInternal] = useState(value)
  return (
    <Slider
      {...args}
      value={internal}
      onChange={(next) => {
        setInternal(next)
        onChange(next)
      }}
    />
  )
}

const meta = {
  title: "UI/Slider",
  component: Slider,
  args: {
    label: "Energy level",
    description: "How much energy do you want this to take?",
    min: 0,
    max: 100,
    step: 1,
    value: 50,
    onChange: fn(),
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    lowLabel: { control: "text" },
    highLabel: { control: "text" },
    showValue: { control: "boolean" },
    min: { control: { type: "number" } },
    max: { control: { type: "number" } },
    step: { control: { type: "number" } },
  },
  render: (args) => <ControlledSlider {...args} />,
} satisfies Meta<typeof Slider>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithAnchors: Story = {
  args: {
    label: "Time commitment",
    description: undefined,
    lowLabel: "Quick",
    highLabel: "All day",
    showValue: false,
    value: 30,
  },
}

export const Minimal: Story = {
  args: {
    label: undefined,
    description: undefined,
    showValue: false,
    value: 25,
  },
}
