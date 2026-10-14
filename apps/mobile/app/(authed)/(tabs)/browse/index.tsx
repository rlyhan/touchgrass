import { useRef, useState } from "react"
import { ActivityIndicator, FlatList, Text, View } from "react-native"

import type { ListedActivity } from "@/components/activities/activity-list"
import { ActivityListScreen } from "@/components/activities/activity-list-screen"
import { Pagination } from "@/components/ui/pagination"
import { Pill } from "@/components/ui/pill"
import { SearchField } from "@/components/ui/search-field"
import { useActivitySearch } from "@/lib/browse/use-activity-search"
import { useRandomActivities } from "@/lib/browse/use-random-activities"
import { getActivityTypeIcon, getFieldIcon, TimeIcon } from "@/lib/icons"
import { colors } from "@/lib/theme/colors"
import { ACTIVITY_FIELDS, ACTIVITY_TYPES } from "@touchgrass/types/constants"
import { ChevronDown, ChevronUp, X } from "lucide-react-native"

const FILTERS = [
  {
    key: "type",
    btnLabel: "Activity type",
    options: [...ACTIVITY_TYPES].sort(),
    getIcon: getActivityTypeIcon,
  },
  {
    key: "field",
    btnLabel: "Field",
    options: [...ACTIVITY_FIELDS].sort(),
    getIcon: getFieldIcon,
  },
  {
    key: "time",
    btnLabel: "Time",
    options: ["Under 1 hour", "1–3 hours", "Half day", "Full day"],
    getIcon: () => TimeIcon,
  },
]

export default function BrowsePage() {
  const randomActivities = useRandomActivities()
  const search = useActivitySearch()
  const listRef = useRef<FlatList<ListedActivity>>(null)
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})

  const openFilter = FILTERS.find((filter) => filter.key === openFilterKey)

  function toggleOption(filterKey: string, option: string) {
    setSelectedOptions((prev) => {
      const current = prev[filterKey] ?? []
      return {
        ...prev,
        [filterKey]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      }
    })
  }

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
          <View className="my-4">
            <SearchField
              label="Search activities"
              value={search.query}
              onChangeText={search.changeQuery}
            />
          </View>
          <View className="mb-4 flex flex-row gap-2">
            {FILTERS.map((filter) => {
              const open = filter.key === openFilterKey
              return (
                <Pill
                  key={filter.key}
                  label={filter.btnLabel}
                  active={open}
                  trailingIcon={open ? ChevronUp : ChevronDown}
                  onPress={() => setOpenFilterKey(open ? null : filter.key)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                />
              )
            })}
          </View>
          {openFilter ? (
            <View className="mb-6 flex-row flex-wrap gap-2">
              {openFilter.options.map((option) => {
                const selected = selectedOptions[openFilter.key]?.includes(option) ?? false
                return (
                  <Pill
                    key={option}
                    label={option}
                    active={selected}
                    size="sm"
                    leadingIcon={openFilter.getIcon(option)}
                    trailingIcon={selected ? X : undefined}
                    onPress={() => toggleOption(openFilter.key, option)}
                    accessibilityRole="togglebutton"
                    accessibilityLabel={selected ? `Remove ${option} filter` : option}
                    accessibilityState={{ selected }}
                  />
                )
              })}
            </View>
          ) : null}
        </>
      }
    />
  )
}
