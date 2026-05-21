import { createClient } from "@sanity/client"

import type { LoadSanityActivities, SanityActivity } from "./source.js"

const client = createClient({
  projectId: "93cev0va",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
  perspective: "published",
})

const ACTIVITIES_QUERY = `*[_type == "activity" && defined(slug.current) && defined(title)]{
  "slug": slug.current,
  title,
  "imageUrl": imageUrl.asset->url,
  type,
  field,
  estimated_time,
  related_types,
  patternTypes,
  description
}`

export const fetchActivitiesFromSanity: LoadSanityActivities = async () => {
  try {
    return await client.fetch<SanityActivity[]>(ACTIVITIES_QUERY)
  } catch (error) {
    console.error(
      "Failed to fetch activities from Sanity, falling back to mocks only",
      error,
    )
    return []
  }
}
