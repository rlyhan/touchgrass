import type { Request, Response } from "express"

import type { User } from "../db/schema.js"
import { getRecommendations } from "../lib/recommendation-algorithm.js"

export type GetRecommendationsDeps = {
  getUserById: (id: string) => Promise<User | null>
}

export function getRecommendationsHandler({
  getUserById,
}: GetRecommendationsDeps) {
  return async function handler(
    req: Request<{ userId: string }>,
    res: Response,
  ) {
    const { userId } = req.params

    try {
      const user = await getUserById(userId)
      if (!user) {
        res.status(404).json({ error: "User not found" })
        return
      }
      const recommendations = getRecommendations(user.personality).map(
        (s) => s.rec,
      )
      res.status(200).json({ recommendations })
    } catch (error) {
      console.error("Failed to get recommendations", error)
      res.status(500).json({ error: "Failed to get recommendations" })
    }
  }
}
