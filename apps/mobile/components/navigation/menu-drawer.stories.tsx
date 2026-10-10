import type { Meta, StoryObj } from "@storybook/react-native"
import { fn } from "storybook/test"

import { MenuDrawer } from "./menu-drawer"

const meta = {
  title: "Navigation/MenuDrawer",
  component: MenuDrawer,
  args: {
    visible: true,
    onClose: fn(),
  },
} satisfies Meta<typeof MenuDrawer>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = {}
