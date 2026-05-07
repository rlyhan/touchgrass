import { createApp } from "./app.js"
import { getSessionUserId } from "./auth-session.js"
import { getProfileByAuthUserId, insertProfile } from "./db/profiles.js"

const app = createApp({
  insertProfile,
  getProfileByAuthUserId,
  getSessionUserId,
})
const port = Number(process.env.PORT ?? 3000)

app.listen(port, () => {
  console.log(`@touchgrass/core: listening on http://localhost:${port}`)
})
