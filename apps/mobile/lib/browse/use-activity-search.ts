import { useRef, useState } from "react"

import { searchActivities } from "@/lib/browse/api"
import { prefetchLeadImages } from "@/lib/images/prefetch"
import type { Activity } from "@touchgrass/types"

const SEARCH_PAGE_SIZE = 10

export function useActivitySearch() {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [results, setResults] = useState<Activity[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const latestRequest = useRef(0)

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

  function changeQuery(text: string) {
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

  function changePage(nextPage: number) {
    setPage(nextPage)
    loadPage(query, nextPage)
  }

  return {
    query,
    searching: query.trim() !== "",
    page,
    pageCount: Math.ceil(total / SEARCH_PAGE_SIZE),
    results,
    loading,
    changeQuery,
    changePage,
  }
}
