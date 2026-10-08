import { useMemo, useRef, useState } from "react"
import { FlatList, Text, TextInput } from "react-native"

import type { ListedActivity } from "@/components/recommendations/activity-list"
import { ActivityListScreen } from "@/components/recommendations/activity-list-screen"
import { Pagination } from "@/components/ui/pagination"
import { colors } from "@/lib/theme/colors"
import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { Activity } from "@touchgrass/types"

const RANDOM_ACTIVITY_COUNT = 10
const SEARCH_PAGE_SIZE = 10

function generateRandomActivities(): Activity[] {
  const randomActivities = new Set<Activity>()
  while (randomActivities.size < Math.min(RANDOM_ACTIVITY_COUNT, RECOMMENDATIONS.length)) {
    randomActivities.add(RECOMMENDATIONS[Math.floor(Math.random() * RECOMMENDATIONS.length)])
  }
  return Array.from(randomActivities)
}

function matchesQuery(activity: Activity, query: string): boolean {
  return [activity.title, activity.field, activity.type].some((value) =>
    value.toLowerCase().includes(query),
  )
}

export default function BrowsePage() {
  const randomActivities = useMemo(generateRandomActivities, [])
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const listRef = useRef<FlatList<ListedActivity>>(null)

  const searchResults = useMemo(() => {
    const normalised = query.trim().toLowerCase()
    if (!normalised) return null
    return RECOMMENDATIONS.filter((activity) => matchesQuery(activity, normalised))
  }, [query])

  const pageCount = searchResults ? Math.ceil(searchResults.length / SEARCH_PAGE_SIZE) : 0
  const activities = searchResults
    ? searchResults.slice((page - 1) * SEARCH_PAGE_SIZE, page * SEARCH_PAGE_SIZE)
    : randomActivities

  function handleQueryChange(text: string) {
    setQuery(text)
    setPage(1)
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage)
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
  }

  return (
    <ActivityListScreen
      listRef={listRef}
      activities={activities}
      footer={
        pageCount > 1 ? (
          <Pagination page={page} pageCount={pageCount} onPageChange={handlePageChange} />
        ) : null
      }
      header={
        <>
          <Text className="mt-10 text-3xl font-bold tracking-tight text-gray-900">
            Browse activities
          </Text>
          <TextInput
            value={query}
            onChangeText={handleQueryChange}
            placeholder="Search activities"
            placeholderTextColor={colors.gray[400]}
            accessibilityLabel="Search activities"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            className="mb-8 mt-4 h-12 rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900"
          />
        </>
      }
    />
  )
}
