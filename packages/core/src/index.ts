import { createApp } from "./app.js"
import { getUserById, insertUser } from "./db/users.js"

const app = createApp({ insertUser, getUserById })
const port = Number(process.env.PORT ?? 3000)

app.listen(port, () => {
  console.log(`@touchgrass/core: listening on http://localhost:${port}`)
})
