import { View } from "react-native"
import type { Meta, StoryObj } from "@storybook/react-native"
import { fn } from "storybook/test"

import { OnboardingLoadingView } from "./loading-screen"

const meta = {
  title: "Onboarding/LoadingScreen",
  component: OnboardingLoadingView,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, marginHorizontal: -16, marginVertical: -16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    status: "loading",
    onRetry: fn(),
  },
  argTypes: {
    status: {
      control: { type: "radio" },
      options: ["loading", "error"],
    },
  },
} satisfies Meta<typeof OnboardingLoadingView>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {}

export const Error: Story = {
  args: { status: "error" },
}
