import type { Request, Response } from "express"
import { z } from "zod"

import type { Activity } from "@touchgrass/types"

export type GetActivityDeps = {
  getActivityBySlug: (slug: string) => Promise<Activity | null>
  getSessionUserId: (req: Request) => Promise<string | null>
}

const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9-]+$/, "must be lowercase alphanumeric with hyphens")

export function getActivityHandler({
  getActivityBySlug,
  getSessionUserId,
}: GetActivityDeps) {
  return async function handler(
    req: Request<{ slug: string }>,
    res: Response,
  ): Promise<void> {
    const authUserId = await getSessionUserId(req)
    if (!authUserId) {
      res.status(401).json({ error: "Not authenticated" })
      return
    }

    const parsedSlug = slugSchema.safeParse(req.params.slug)
    if (!parsedSlug.success) {
      res.status(400).json({
        errors: parsedSlug.error.issues.map(({ path, message }) => ({
          path,
          message,
        })),
      })
      return
    }

    try {
      const activity = await getActivityBySlug(parsedSlug.data)
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
