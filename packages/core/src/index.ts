import { toNodeHandler } from "better-auth/node"

import { createApp } from "./app.js"
import { auth, corsOrigins } from "./auth/auth.js"
import { getSessionUserId } from "./auth/session.js"
import { getProfileByAuthUserId, insertProfile } from "./db/profiles.js"
import {
  createFetchActivitiesFromSanity,
  createSanityClient,
  readSanityConfigFromEnv,
} from "./recommendations/sanity-source.js"
import { createActivityLoader } from "./recommendations/source.js"

const sanityClient = createSanityClient(readSanityConfigFromEnv())
const fetchActivitiesFromSanity = createFetchActivitiesFromSanity(sanityClient)
const loadActivities = createActivityLoader(fetchActivitiesFromSanity)
const getActivityBySlug = async (slug: string) => {
  const activities = await loadActivities()
  return activities.find((a) => a.slug === slug) ?? null
}

const app = createApp({
  authHandler: toNodeHandler(auth),
  corsOrigins,
  insertProfile,
  getProfileByAuthUserId,
  getSessionUserId,
  loadActivities,
  getActivityBySlug,
})
const port = Number(process.env.PORT ?? 3000)

app.listen(port, () => {
  console.log(`@touchgrass/core: listening on http://localhost:${port}`)
})
