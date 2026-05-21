import type { Meta, StoryObj } from "@storybook/react-native"
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { PrimaryButton } from "@/components/ui/primary-button"
import { RecommendationCard } from "./recommendation-card"

// ── shared fixtures ───────────────────────────────────────────────────────────
const ACTIVITY = {
  title: "Beginner sourdough at a neighborhood class",
  imageUrl:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
  type: "Constructive",
  field: "Cooking",
  estimatedTime: "2 hrs",
}

const DESCRIPTION =
  "In this beginner-friendly class you'll learn to make sourdough from scratch — starter maintenance, hydration, shaping, and scoring.\n\nAll ingredients and tools are provided. No prior baking experience required."

// ── shared sub-components ─────────────────────────────────────────────────────
function Header() {
  return (
    <View className="z-10 bg-white/80 px-4 py-3">
      <Pressable
        className="h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white"
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        {/* ArrowLeft placeholder — icons are not renderable in Storybook web */}
        <Text className="text-base text-gray-800">←</Text>
      </Pressable>
    </View>
  )
}

// ── story components (one per visual state) ───────────────────────────────────
function LoadedState({ description }: { description?: string }) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <Header />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <RecommendationCard {...ACTIVITY} size="large" />

        {description ? (
          <View className="mt-6">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              About this activity
            </Text>
            {description.split("\n\n").map((paragraph, index) => (
              <Text key={index} className="mb-4 leading-relaxed text-gray-500">
                {paragraph}
              </Text>
            ))}
          </View>
        ) : null}

        <View className="mt-8">
          <PrimaryButton label="Start this activity" onPress={() => {}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function LoadingState() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    </SafeAreaView>
  )
}

function NotFoundState() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 items-center justify-center">
        <Text className="text-base text-gray-500">Activity not found.</Text>
      </View>
    </SafeAreaView>
  )
}

// ── Storybook meta ────────────────────────────────────────────────────────────
const meta = {
  title: "Activities/ActivityDetailPage",
  component: LoadedState,
} satisfies Meta<typeof LoadedState>

export default meta

type Story = StoryObj<typeof meta>

export const WithDescription: Story = {
  args: { description: DESCRIPTION },
}

export const WithoutDescription: Story = {
  args: {},
}

export const Loading: Story = {
  render: () => <LoadingState />,
}

export const NotFound: Story = {
  render: () => <NotFoundState />,
}
