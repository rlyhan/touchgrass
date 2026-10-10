import { router, type Href } from "expo-router"
import { useCallback, type Ref } from "react"
import { FlatList, Pressable, View, type FlatListProps } from "react-native"

import { ActivityCard } from "@/components/activities/activity-card"
import type { Activity, PatternTypeId } from "@touchgrass/types"

export type ListedActivity = Activity & { dominantPatternId?: PatternTypeId | null }

type Props = Omit<FlatListProps<ListedActivity>, "data" | "renderItem" | "keyExtractor"> & {
  activities: ListedActivity[]
  ref?: Ref<FlatList<ListedActivity>>
}

function activityHref({ slug, dominantPatternId }: ListedActivity): Href {
  const base = `/activities/${slug}`
  return (dominantPatternId ? `${base}?pattern=${encodeURIComponent(dominantPatternId)}` : base) as Href
}

const ItemSeparator = () => <View style={{ height: 16 }} />

export function ActivityList({ activities, ref, ...listProps }: Props) {
  const renderItem = useCallback(
    ({ item: activity }: { item: ListedActivity }) => (
      <Pressable
        onPress={() => router.push(activityHref(activity))}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${activity.title}`}
      >
        <ActivityCard
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
      ref={ref}
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
