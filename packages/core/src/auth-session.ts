import { fromNodeHeaders } from "better-auth/node"
import type { Request } from "express"

import { auth } from "./auth.js"

export async function getSessionUserId(req: Request): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })
  return session?.user.id ?? null
}
