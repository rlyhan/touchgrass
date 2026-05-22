import { createApp } from "./app.js"
import { getSessionUserId } from "./auth-session.js"
import { getProfileByAuthUserId, insertProfile } from "./db/profiles.js"
import {
  createFetchActivitiesFromSanity,
  createSanityClient,
  readSanityConfigFromEnv,
} from "./recommendations/sanity-source.js"
import { createRecommendationLoader } from "./recommendations/source.js"

const sanityClient = createSanityClient(readSanityConfigFromEnv())
const fetchActivitiesFromSanity = createFetchActivitiesFromSanity(sanityClient)
const loadRecommendations = createRecommendationLoader(fetchActivitiesFromSanity)
const getActivityBySlug = async (slug: string) => {
  const activities = await loadRecommendations()
  return activities.find((a) => a.slug === slug) ?? null
}

const app = createApp({
  insertProfile,
  getProfileByAuthUserId,
  getSessionUserId,
  loadRecommendations,
  getActivityBySlug,
})
const port = Number(process.env.PORT ?? 3000)

app.listen(port, () => {
  console.log(`@touchgrass/core: listening on http://localhost:${port}`)
})
