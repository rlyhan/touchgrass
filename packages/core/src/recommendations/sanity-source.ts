import { createClient, type SanityClient } from "@sanity/client"

import type { LoadSanityActivities, SanityActivity } from "./source.js"

export type SanityClientConfig = {
  projectId: string
  dataset: string
  apiVersion: string
  useCdn?: boolean
}

const ACTIVITIES_QUERY = `*[_type == "activity" && defined(slug.current) && defined(title)]{
  "slug": slug.current,
  title,
  "imageUrl": imageUrl.asset->url,
  type,
  field,
  estimated_time,
  related_types,
  description,
  tips,
  instructions,
}`

export function createSanityClient(config: SanityClientConfig): SanityClient {
  return createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: config.useCdn ?? true,
    perspective: "published",
  })
}

export function createFetchActivitiesFromSanity(
  client: Pick<SanityClient, "fetch">,
): LoadSanityActivities {
  return async () => {
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
}

export function readSanityConfigFromEnv(): SanityClientConfig {
  const projectId = process.env.SANITY_PROJECT_ID
  if (!projectId) {
    throw new Error("SANITY_PROJECT_ID is not set")
  }
  const dataset = process.env.SANITY_DATASET
  if (!dataset) {
    throw new Error("SANITY_DATASET is not set")
  }
  const apiVersion = process.env.SANITY_API_VERSION
  if (!apiVersion) {
    throw new Error("SANITY_API_VERSION is not set")
  }
  return { projectId, dataset, apiVersion }
}
