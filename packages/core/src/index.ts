import { toNodeHandler } from "better-auth/node"

import { createApp } from "./app.js"
import { auth, corsOrigins } from "./auth/auth.js"
import { getSessionUserId } from "./auth/session.js"
import { getProfileByAuthUserId, insertProfile } from "./db/profiles.js"
import {
  createFetchActivitiesFromSanity,
  createSanityClient,
  readSanityConfigFromEnv,
} from "./catalog/sanity-source.js"
import { createActivityBySlugGetter, createActivityLoader } from "./catalog/source.js"

const sanityClient = createSanityClient(readSanityConfigFromEnv())
const fetchActivitiesFromSanity = createFetchActivitiesFromSanity(sanityClient)
const loadActivities = createActivityLoader(fetchActivitiesFromSanity)
const getActivityBySlug = createActivityBySlugGetter(loadActivities)

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
