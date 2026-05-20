import type { Meta, StoryObj } from "@storybook/react-native"
import { Sparkle } from "lucide-react-native"
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

const EXTENDED = {
  aiSummary:
    "This activity was recommended because it aligns with your creative interests and fits well within your current energy and budget.",
  description:
    "In this beginner-friendly class you'll learn to make sourdough from scratch — starter maintenance, hydration, shaping, and scoring.\n\nAll ingredients and tools are provided. No prior baking experience required.",
}

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
function LoadedState() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <Header />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <RecommendationCard {...ACTIVITY} size="large" />

        <View className="mt-6 rounded-2xl bg-emerald-50 p-5">
          <View className="flex-row items-start gap-3">
            <View className="h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Sparkle size={16} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-sm font-semibold text-gray-900">
                Summary
              </Text>
              <Text className="text-sm leading-relaxed text-gray-500">
                {EXTENDED.aiSummary}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            About this activity
          </Text>
          {EXTENDED.description.split("\n\n").map((paragraph, index) => (
            <Text key={index} className="mb-4 leading-relaxed text-gray-500">
              {paragraph}
            </Text>
          ))}
        </View>

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
      <Header />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <RecommendationCard {...ACTIVITY} size="large" />

        <View className="mt-6 items-center py-8">
          <ActivityIndicator size="small" color="#10b981" />
        </View>

        <View className="mt-8">
          <PrimaryButton label="Start this activity" onPress={() => {}} />
        </View>
      </ScrollView>
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
  title: "Recommendations/RecommendationDetailPage",
  component: LoadedState,
} satisfies Meta<typeof LoadedState>

export default meta

type Story = StoryObj<typeof meta>

export const Loaded: Story = {}

export const Loading: Story = {
  render: () => <LoadingState />,
}

export const NotFound: Story = {
  render: () => <NotFoundState />,
}
