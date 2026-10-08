import { router, type Href } from "expo-router"
import { useCallback } from "react"
import { FlatList, Pressable, View, type FlatListProps } from "react-native"

import { RecommendationCard } from "@/components/recommendations/recommendation-card"
import type { Activity } from "@touchgrass/types"

type Props = Omit<FlatListProps<Activity>, "data" | "renderItem" | "keyExtractor"> & {
  activities: Activity[]
}

const ItemSeparator = () => <View style={{ height: 16 }} />

export function ActivityList({ activities, ...listProps }: Props) {
  const renderItem = useCallback(
    ({ item: activity }: { item: Activity }) => (
      <Pressable
        onPress={() => router.push(`/activities/${activity.slug}` as Href)}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${activity.title}`}
      >
        <RecommendationCard
          title={activity.title}
          imageUrl={activity.imageUrl}
          type={activity.type}
          field={activity.field}
          estimatedTime={activity.estimated_time}
        />
      </Pressable>
    ),
    [],
  )

  return (
    <FlatList
      data={activities}
      keyExtractor={(activity) => activity.slug}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparator}
      initialNumToRender={5}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 }}
      {...listProps}
    />
  )
}
