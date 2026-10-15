import type { Request, Response } from "express"
import { z } from "zod"

import type { Activity } from "@touchgrass/types"
import { ACTIVITY_FIELDS, ACTIVITY_TYPES } from "@touchgrass/types/constants"

import type { LoadRecommendations } from "../recommendations/source.js"

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

    const activity = await getActivityBySlug(parsedSlug.data)
    if (!activity) {
      res.status(404).json({ error: "Activity not found" })
      return
    }
    res.status(200).json({ activity })
  }
}

export type SearchActivitiesDeps = {
  loadRecommendations: LoadRecommendations
}

function commaSeparated<T extends string>(values: readonly T[]) {
  return z
    .string()
    .transform((value) => value.split(",").filter(Boolean))
    .pipe(z.array(z.enum(values)))
    .optional()
}

const searchQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
  type: commaSeparated(ACTIVITY_TYPES),
  field: commaSeparated(ACTIVITY_FIELDS),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export function searchActivitiesHandler({ loadRecommendations }: SearchActivitiesDeps) {
  return async function handler(req: Request, res: Response): Promise<void> {
    const parsedQuery = searchQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      res.status(400).json({
        errors: parsedQuery.error.issues.map(({ path, message }) => ({
          path,
          message,
        })),
      })
      return
    }

    const { q, type, field, offset, limit } = parsedQuery.data
    const query = q.toLowerCase()
    const matches = (await loadRecommendations()).filter(
      (activity) =>
        (!type?.length || type.includes(activity.type)) &&
        (!field?.length || field.includes(activity.field)) &&
        [activity.title, activity.field, activity.type].some((value) =>
          value.toLowerCase().includes(query),
        ),
    )
    res.status(200).json({
      items: matches.slice(offset, offset + limit),
      total: matches.length,
    })
  }
}

const randomQuerySchema = z.object({
  count: z.coerce.number().int().min(1).max(50).default(10),
})

export function randomActivitiesHandler({
  loadRecommendations,
}: {
  loadRecommendations: LoadRecommendations
}) {
  return async function handler(req: Request, res: Response): Promise<void> {
    const parsedQuery = randomQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      res.status(400).json({
        errors: parsedQuery.error.issues.map(({ path, message }) => ({
          path,
          message,
        })),
      })
      return
    }

    const pool = [...(await loadRecommendations())]
    const activities: Activity[] = []
    while (activities.length < parsedQuery.data.count && pool.length > 0) {
      activities.push(...pool.splice(Math.floor(Math.random() * pool.length), 1))
    }
    res.status(200).json({ activities })
  }
}
