import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-native"
import { fn } from "storybook/test"

import { BottomNav, type BottomNavTab } from "./bottom-nav"

const meta = {
  title: "Navigation/BottomNav",
  component: BottomNav,
  args: {
    activeTab: "home",
    onTabPress: fn(),
  },
  argTypes: {
    activeTab: { control: "radio", options: ["home", "browse"] },
  },
} satisfies Meta<typeof BottomNav>

export default meta

type Story = StoryObj<typeof meta>

export const HomeActive: Story = {}

export const BrowseActive: Story = {
  args: { activeTab: "browse" },
}

function InteractiveBottomNav() {
  const [tab, setTab] = useState<BottomNavTab>("home")
  return <BottomNav activeTab={tab} onTabPress={setTab} />
}

export const Interactive: Story = {
  render: () => <InteractiveBottomNav />,
}
