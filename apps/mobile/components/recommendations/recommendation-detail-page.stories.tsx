import type { PortableTextBlock } from "@portabletext/types"
import type { Meta, StoryObj } from "@storybook/react-native"
import { Lightbulb } from "lucide-react-native"
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { PortableText } from "@/components/ui/portable-text"
import { PrimaryButton } from "@/components/ui/primary-button"
import type { ActivityInstruction, ActivityTip } from "@touchgrass/types"
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

const DESCRIPTION: PortableTextBlock[] = [
  {
    _type: "block",
    _key: "p1",
    style: "normal",
    children: [
      {
        _type: "span",
        _key: "p1s1",
        text:
          "In this beginner-friendly class you'll learn to make sourdough from scratch — starter maintenance, hydration, shaping, and scoring.",
        marks: [],
      },
    ],
    markDefs: [],
  },
  {
    _type: "block",
    _key: "p2",
    style: "normal",
    children: [
      {
        _type: "span",
        _key: "p2s1",
        text: "All ingredients and tools are provided. No prior baking experience required.",
        marks: [],
      },
    ],
    markDefs: [],
  },
]

const TIPS: ActivityTip[] = [
  {
    key: "sourdough-tip-0",
    description:
      "Warm your oven with a baking stone or Dutch oven inside for at least 45 minutes for an even bake.",
  },
  {
    key: "sourdough-tip-1",
    description:
      "If your dough feels too slack, do one extra stretch-and-fold before shaping.",
  },
  {
    key: "sourdough-tip-2",
    description: "Score with a sharp blade at a shallow angle for the prettiest ear.",
  },
]

const INSTRUCTIONS: ActivityInstruction[] = [
  {
    title: "Feed your starter",
    description:
      "12 hours before class, give your starter equal parts flour and water and leave it at room temperature until it doubles.",
  },
  {
    title: "Mix and autolyse",
    description:
      "Combine flour and water, rest for 30 minutes, then add salt and starter and mix until just incorporated.",
  },
  {
    title: "Bulk ferment with stretch-and-folds",
    description:
      "Over 3–4 hours, perform a set of stretch-and-folds every 30 minutes until the dough is smooth and airy.",
  },
  {
    title: "Shape and proof",
  },
  {
    title: "Score and bake",
    description: "Bake covered at 250°C for 20 minutes, then uncovered for another 20 until deeply golden.",
  },
]

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
function LoadedState({
  description,
  instructions,
  tips,
}: {
  description?: PortableTextBlock[]
  instructions?: ActivityInstruction[]
  tips?: ActivityTip[]
}) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <Header />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <RecommendationCard {...ACTIVITY} size="large" />

        {description && description.length > 0 ? (
          <View className="mt-6">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              About this activity
            </Text>
            <PortableText blocks={description} />
          </View>
        ) : null}

        {tips && tips.length > 0 ? (
          <View className="mt-6 gap-3">
            {tips.map((tip) => (
              <View
                key={tip.key}
                className="flex-row items-start rounded-2xl p-4"
                style={{ backgroundColor: "#FFF3E0" }}
              >
                <Lightbulb size={18} color="#C2692A" style={{ marginTop: 2, marginRight: 10 }} />
                <Text className="flex-1 leading-relaxed text-gray-800">
                  <Text className="font-semibold text-gray-900">Tip: </Text>
                  {tip.description}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {instructions && instructions.length > 0 ? (
          <View className="mt-6">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Instructions
            </Text>
            {instructions.map((step, idx) => (
              <View key={idx} className="mb-4 flex-row items-start">
                <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-emerald-500">
                  <Text className="text-sm font-semibold text-white">
                    {idx + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-base font-semibold text-gray-900">
                    {step.title}
                  </Text>
                  {step.description ? (
                    <Text className="leading-relaxed text-gray-500">
                      {step.description}
                    </Text>
                  ) : null}
                </View>
              </View>
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

export const WithInstructions: Story = {
  args: { instructions: INSTRUCTIONS },
}

export const WithDescriptionAndInstructions: Story = {
  args: { description: DESCRIPTION, instructions: INSTRUCTIONS },
}

export const WithTips: Story = {
  args: { tips: TIPS },
}

export const WithEverything: Story = {
  args: { description: DESCRIPTION, instructions: INSTRUCTIONS, tips: TIPS },
}

export const Loading: Story = {
  render: () => <LoadingState />,
}

export const NotFound: Story = {
  render: () => <NotFoundState />,
}
