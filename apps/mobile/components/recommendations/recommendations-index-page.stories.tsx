import type { Meta, StoryObj } from "@storybook/react-native"
import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { GrassLogo } from "@/components/icons/grass-logo"
import { PrimaryButton } from "@/components/ui/primary-button"
import { RecommendationCard } from "./recommendation-card"

const ItemSeparator = () => <View style={{ height: 16 }} />

// ── story components (one per visual state) ───────────────────────────────────
function LoadedState() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <FlatList
        data={RECOMMENDATIONS}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View details for ${item.title}`}
          >
            <RecommendationCard
              title={item.title}
              imageUrl={item.imageUrl}
              type={item.type}
              field={item.field}
              estimatedTime={item.estimated_time}
            />
          </Pressable>
        )}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 32,
          paddingBottom: 32,
        }}
        ListHeaderComponent={
          <>
            <View className="items-center">
              <GrassLogo />
            </View>
            <Text className="mb-6 mt-8 text-3xl font-bold tracking-tight text-gray-900">
              You might be great at...
            </Text>
          </>
        }
        ListFooterComponent={
          <View className="mt-10 items-center">
            <Pressable accessibilityRole="button" accessibilityLabel="Sign out">
              <Text className="text-sm font-medium text-gray-500">Sign out</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  )
}

function LoadingState() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 items-center justify-center px-8">
        <GrassLogo />
        <ActivityIndicator size="large" color="#10b981" className="mt-10" />
      </View>
    </SafeAreaView>
  )
}

function ErrorState() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 items-center justify-center px-8">
        <GrassLogo />
        <Text className="mt-10 text-center text-xl font-semibold text-gray-900">
          Couldn&apos;t load your recommendations.
        </Text>
        <View className="mt-8 w-full">
          <PrimaryButton label="Try again" onPress={() => { }} />
        </View>
        <Pressable
          className="mt-6"
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text className="text-sm font-medium text-gray-500">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

// ── Storybook meta ────────────────────────────────────────────────────────────
const meta = {
  title: "Recommendations/RecommendationsIndexPage",
  component: LoadedState,
} satisfies Meta<typeof LoadedState>

export default meta

type Story = StoryObj<typeof meta>

export const Loaded: Story = {}

export const Loading: Story = {
  render: () => <LoadingState />,
}

export const Error: Story = {
  render: () => <ErrorState />,
}
