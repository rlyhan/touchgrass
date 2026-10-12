import { useRef } from "react"
import { ActivityIndicator, FlatList, Text, View } from "react-native"

import type { ListedActivity } from "@/components/activities/activity-list"
import { ActivityListScreen } from "@/components/activities/activity-list-screen"
import { Pagination } from "@/components/ui/pagination"
import { SearchField } from "@/components/ui/search-field"
import { useActivitySearch } from "@/lib/browse/use-activity-search"
import { useRandomActivities } from "@/lib/browse/use-random-activities"
import { colors } from "@/lib/theme/colors"

export default function BrowsePage() {
  const randomActivities = useRandomActivities()
  const search = useActivitySearch()
  const listRef = useRef<FlatList<ListedActivity>>(null)

  function handlePageChange(nextPage: number) {
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
    search.changePage(nextPage)
  }

  const showPagination = search.searching && search.pageCount > 1
  const showSpinner = search.loading || (!search.searching && randomActivities === null)
  const showNoResults = search.searching && !search.loading && search.results.length === 0

  return (
    <ActivityListScreen
      listRef={listRef}
      activities={search.searching ? search.results : (randomActivities ?? [])}
      empty={
        showNoResults ? (
          <Text className="text-center text-base text-gray-500">
            No activities match &ldquo;{search.query.trim()}&rdquo;
          </Text>
        ) : null
      }
      footer={
        showSpinner || showPagination ? (
          <>
            {showSpinner ? <ActivityIndicator color={colors.emerald[500]} className="mb-6" /> : null}
            {showPagination ? (
              <Pagination
                page={search.page}
                pageCount={search.pageCount}
                onPageChange={handlePageChange}
              />
            ) : null}
          </>
        ) : null
      }
      header={
        <>
          <Text className="mt-10 text-3xl font-bold tracking-tight text-gray-900">
            Browse activities
          </Text>
          <View className="mb-8 mt-4">
            <SearchField
              label="Search activities"
              value={search.query}
              onChangeText={search.changeQuery}
            />
          </View>
        </>
      }
    />
  )
}
