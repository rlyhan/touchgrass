import { useEffect, useState } from "react"

import { fetchRandomActivities } from "@/lib/browse/api"
import { prefetchLeadImages } from "@/lib/images/prefetch"
import type { Activity } from "@touchgrass/types"

const RANDOM_ACTIVITY_COUNT = 10

// Picked after mount so the web build's pre-rendered HTML (which can't know
// the random pick) matches the browser's first render. Null until ready.
export function useRandomActivities(): Activity[] | null {
  const [activities, setActivities] = useState<Activity[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchRandomActivities(RANDOM_ACTIVITY_COUNT).then(async (picked) => {
      await prefetchLeadImages(picked)
      if (!cancelled) setActivities(picked)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return activities
}
