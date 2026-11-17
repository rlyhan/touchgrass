import cors from "cors"
import express, {
  type Express,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express"

import { mountAuth } from "./auth/routes.js"
import { authLimiter, profileLimiter, readLimiter } from "./rate-limit.js"
import {
  type GetActivityDeps,
  type SearchActivitiesDeps,
  getActivityHandler,
  randomActivitiesHandler,
  searchActivitiesHandler,
} from "./routes/activities/route.js"
import {
  type CreateProfileDeps,
  createProfileHandler,
} from "./routes/profile/route.js"
import {
  type GetRecommendationsDeps,
  getRecommendationsHandler,
} from "./routes/recommendations/route.js"
import {
  type GetPatternWeightsDeps,
  getPatternWeightsHandler,
} from "./routes/pattern-weights/route.js"

export type AuthDeps = {
  authHandler: RequestHandler
  corsOrigins: string[]
}

export type AppDeps = AuthDeps &
  CreateProfileDeps &
  GetRecommendationsDeps &
  GetActivityDeps &
  SearchActivitiesDeps &
  GetPatternWeightsDeps

export type AppOptions = {
  disableRateLimits?: boolean
}

export function createApp(deps: AppDeps, options: AppOptions = {}): Express {
  const app = express()
  app.set("trust proxy", 1)
  app.use(
    cors({
      origin: deps.corsOrigins,
      credentials: true,
    }),
  )

  const maybeLimit = (limiter: RequestHandler): RequestHandler[] =>
    options.disableRateLimits ? [] : [limiter]

  mountAuth(app, {
    handler: deps.authHandler,
    limiter: options.disableRateLimits ? undefined : authLimiter,
  })

  app.use(express.json())

  app.get("/health", (_req, res) => {
    res.json({ ok: true })
  })

  // "/profiles" is a legacy alias for already-deployed clients; remove once they have updated.
  app.post(["/profile", "/profiles"], ...maybeLimit(profileLimiter), createProfileHandler(deps))
  app.get("/recommendations", ...maybeLimit(readLimiter), getRecommendationsHandler(deps))
  app.get("/pattern-weights", ...maybeLimit(readLimiter), getPatternWeightsHandler(deps))
  // Must be registered before /activities/:slug, which would otherwise match "search" and "random".
  app.get("/activities/search", ...maybeLimit(readLimiter), searchActivitiesHandler(deps))
  app.get("/activities/random", ...maybeLimit(readLimiter), randomActivitiesHandler(deps))
  app.get("/activities/:slug", ...maybeLimit(readLimiter), getActivityHandler(deps))

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Not found" })
  })

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error", err)
    if (res.headersSent) {
      return
    }
    res.status(500).json({ error: "Internal server error" })
  })

  return app
}
