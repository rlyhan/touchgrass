import { useEffect, useRef, useState } from "react"

import { searchActivities, type SearchFilters } from "@/lib/browse/api"
import { prefetchLeadImages } from "@/lib/images/prefetch"
import type { Activity } from "@touchgrass/types"

const SEARCH_PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300

function hasSelection(filters: SearchFilters) {
  return Object.values(filters).some((values) => values.length > 0)
}

export function useActivitySearch() {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({})
  const [page, setPage] = useState(1)
  const [results, setResults] = useState<Activity[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const latestRequest = useRef(0)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(debounceTimer.current), [])

  async function loadPage(text: string, activeFilters: SearchFilters, pageNumber: number) {
    const requestId = ++latestRequest.current
    setLoading(true)
    try {
      const result = await searchActivities(text, activeFilters, {
        offset: (pageNumber - 1) * SEARCH_PAGE_SIZE,
        limit: SEARCH_PAGE_SIZE,
      })
      // A newer query or page change started while this one was in flight.
      if (requestId !== latestRequest.current) return
      await prefetchLeadImages(result.items)
      if (requestId !== latestRequest.current) return
      setResults(result.items)
      setTotal(result.total)
    } catch {
      // Keep the current page on failure; there's no error UI until search hits the API.
    } finally {
      if (requestId === latestRequest.current) setLoading(false)
    }
  }

  function scheduleSearch(text: string, activeFilters: SearchFilters) {
    setPage(1)
    clearTimeout(debounceTimer.current)
    latestRequest.current++
    if (!text.trim() && !hasSelection(activeFilters)) {
      setResults([])
      setTotal(0)
      setLoading(false)
      return
    }
    // Show the spinner while waiting so "no results" doesn't flash before the search runs.
    setLoading(true)
    debounceTimer.current = setTimeout(() => loadPage(text, activeFilters, 1), SEARCH_DEBOUNCE_MS)
  }

  function changeQuery(text: string) {
    setQuery(text)
    scheduleSearch(text, filters)
  }

  function toggleFilter(key: string, option: string) {
    const current = filters[key] ?? []
    const next = {
      ...filters,
      [key]: current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option],
    }
    setFilters(next)
    scheduleSearch(query, next)
  }

  function changePage(nextPage: number) {
    clearTimeout(debounceTimer.current)
    setPage(nextPage)
    loadPage(query, filters, nextPage)
  }

  return {
    query,
    filters,
    searching: query.trim() !== "" || hasSelection(filters),
    page,
    pageCount: Math.ceil(total / SEARCH_PAGE_SIZE),
    results,
    loading,
    changeQuery,
    toggleFilter,
    changePage,
  }
}
