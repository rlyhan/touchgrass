import type { Request, Response } from "express"

import type { Activity } from "@touchgrass/types"

export type GetActivityDeps = {
  getActivityBySlug: (slug: string) => Promise<Activity | null>
  getSessionUserId: (req: Request) => Promise<string | null>
}

export function getActivityHandler({
  getActivityBySlug,
  getSessionUserId,
}: GetActivityDeps) {
  return async function handler(
    req: Request<{ slug: string }>,
    res: Response,
  ) {
    const authUserId = await getSessionUserId(req)
    if (!authUserId) {
      res.status(401).json({ error: "Not authenticated" })
      return
    }

    try {
      const activity = await getActivityBySlug(req.params.slug)
      if (!activity) {
        res.status(404).json({ error: "Activity not found" })
        return
      }
      res.status(200).json({ activity })
    } catch (error) {
      console.error("Failed to get activity", error)
      res.status(500).json({ error: "Failed to get activity" })
    }
  }
}
