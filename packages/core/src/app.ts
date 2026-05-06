import cors from "cors"
import express, { type Express } from "express"

import { type CreateUserDeps, createUserHandler } from "./onboarding/route.js"
import {
  type GetRecommendationsDeps,
  getRecommendationsHandler,
} from "./recommendations/route.js"

export type AppDeps = CreateUserDeps & GetRecommendationsDeps

export function createApp(deps: AppDeps): Express {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get("/health", (_req, res) => {
    res.json({ ok: true })
  })

  app.post("/users", createUserHandler(deps))
  app.get("/users/:userId/recommendations", getRecommendationsHandler(deps))

  return app
}
