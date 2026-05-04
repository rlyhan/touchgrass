import { Text, View } from "react-native"
import type { Meta, StoryObj } from "@storybook/react-native"
import { fn } from "storybook/test"

import { OnboardingScreenShell } from "./screen-shell"
import { PrimaryButton } from "@/components/ui/primary-button"
import { SkipButton } from "@/components/onboarding/skip-button"

const meta = {
  title: "Onboarding/ScreenShell",
  component: OnboardingScreenShell,
  // The shell renders SafeAreaView and a full-screen layout, so let it fill the canvas.
  decorators: [
    (Story) => (
      <View style={{ flex: 1, marginHorizontal: -16, marginVertical: -16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    step: 1,
    totalSteps: 4,
    title: "What kind of activities do you enjoy?",
    subtitle: "Pick a few that resonate. You can change these later.",
    children: (
      <Text className="text-base text-gray-700">
        Body content goes here — pickers, chip groups, sliders, etc.
      </Text>
    ),
    footer: <PrimaryButton label="Continue" onPress={fn()} />,
  },
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
    step: { control: { type: "range", min: 0, max: 6, step: 1 } },
    totalSteps: { control: { type: "range", min: 1, max: 6, step: 1 } },
  },
} satisfies Meta<typeof OnboardingScreenShell>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoSubtitle: Story = {
  args: { subtitle: undefined },
}

export const WithSkip: Story = {
  args: {
    footer: (
      <View>
        <PrimaryButton label="Continue" onPress={fn()} />
        <SkipButton onPress={fn()} />
      </View>
    ),
  },
}

export const FinalStep: Story = {
  args: {
    step: 4,
    totalSteps: 4,
    title: "You're all set",
    subtitle: "We'll use this to surface fitting recommendations.",
  },
}
