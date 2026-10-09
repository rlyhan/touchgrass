import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, FlatList, Text, View } from "react-native"

import type { ListedActivity } from "@/components/recommendations/activity-list"
import { ActivityListScreen } from "@/components/recommendations/activity-list-screen"
import { Pagination } from "@/components/ui/pagination"
import { SearchField } from "@/components/ui/search-field"
import { searchActivities } from "@/lib/browse/api"
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

export default function BrowsePage() {
  const [randomActivities, setRandomActivities] = useState<Activity[] | null>(null)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [results, setResults] = useState<Activity[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const latestRequest = useRef(0)
  const listRef = useRef<FlatList<ListedActivity>>(null)

  // Picked after mount so the web build's pre-rendered HTML (which can't know
  // the random pick) matches the browser's first render.
  useEffect(() => {
    setRandomActivities(generateRandomActivities())
  }, [])

  async function loadPage(text: string, pageNumber: number) {
    const requestId = ++latestRequest.current
    setLoading(true)
    try {
      const result = await searchActivities(text, {
        offset: (pageNumber - 1) * SEARCH_PAGE_SIZE,
        limit: SEARCH_PAGE_SIZE,
      })
      // A newer query or page change started while this one was in flight.
      if (requestId !== latestRequest.current) return
      setResults(result.items)
      setTotal(result.total)
    } catch {
      // Keep the current page on failure; there's no error UI until search hits the API.
    } finally {
      if (requestId === latestRequest.current) setLoading(false)
    }
  }

  function handleQueryChange(text: string) {
    setQuery(text)
    setPage(1)
    if (!text.trim()) {
      latestRequest.current++
      setResults([])
      setTotal(0)
      setLoading(false)
      return
    }
    loadPage(text, 1)
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage)
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
    loadPage(query, nextPage)
  }

  const searching = query.trim() !== ""
  const pageCount = Math.ceil(total / SEARCH_PAGE_SIZE)
  const showPagination = searching && pageCount > 1
  const showSpinner = loading || (!searching && randomActivities === null)
  const showNoResults = searching && !loading && results.length === 0

  return (
    <ActivityListScreen
      listRef={listRef}
      activities={searching ? results : (randomActivities ?? [])}
      empty={
        showNoResults ? (
          <Text className="text-center text-base text-gray-500">
            No activities match &ldquo;{query.trim()}&rdquo;
          </Text>
        ) : null
      }
      footer={
        showSpinner || showPagination ? (
          <>
            {showSpinner ? <ActivityIndicator color={colors.emerald[500]} className="mb-6" /> : null}
            {showPagination ? (
              <Pagination page={page} pageCount={pageCount} onPageChange={handlePageChange} />
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
              value={query}
              onChangeText={handleQueryChange}
            />
          </View>
        </>
      }
    />
  )
}
