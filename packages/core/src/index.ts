import { createApp } from "./app.js"
import { insertUser } from "./db/users.js"

const app = createApp({ insertUser })
const port = Number(process.env.PORT ?? 3000)

app.listen(port, () => {
  console.log(`@touchgrass/core: listening on http://localhost:${port}`)
})
