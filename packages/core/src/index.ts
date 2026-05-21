import { createApp } from "./app.js"
import { getSessionUserId } from "./auth-session.js"
import { getProfileByAuthUserId, insertProfile } from "./db/profiles.js"
import { fetchActivitiesFromSanity } from "./recommendations/sanity-source.js"
import { createRecommendationLoader } from "./recommendations/source.js"

const loadRecommendations = createRecommendationLoader(fetchActivitiesFromSanity)

const app = createApp({
  insertProfile,
  getProfileByAuthUserId,
  getSessionUserId,
  loadRecommendations,
})
const port = Number(process.env.PORT ?? 3000)

app.listen(port, () => {
  console.log(`@touchgrass/core: listening on http://localhost:${port}`)
})
