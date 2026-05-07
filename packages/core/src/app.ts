import cors from "cors"
import express, { type Express } from "express"

import { auth } from "./auth.js"
import { toNodeHandler } from "better-auth/node"
import {
  type CreateProfileDeps,
  createProfileHandler,
} from "./onboarding/route.js"
import {
  type GetRecommendationsDeps,
  getRecommendationsHandler,
} from "./recommendations/route.js"

export type AppDeps = CreateProfileDeps & GetRecommendationsDeps

export function createApp(deps: AppDeps): Express {
  const app = express()
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  )

  app.all("/api/auth/{*splat}", toNodeHandler(auth))

  app.use(express.json())

  app.get("/health", (_req, res) => {
    res.json({ ok: true })
  })

  app.post("/profiles", createProfileHandler(deps))
  app.get("/recommendations", getRecommendationsHandler(deps))

  return app
}
