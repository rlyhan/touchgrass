import cors from "cors"
import express, {
  type Express,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express"
import rateLimit from "express-rate-limit"

import { mountAuth } from "./auth/routes.js"
import {
  type GetActivityDeps,
  type SearchActivitiesDeps,
  getActivityHandler,
  randomActivitiesHandler,
  searchActivitiesHandler,
} from "./activities/route.js"
import {
  type CreateProfileDeps,
  createProfileHandler,
} from "./profiles/route.js"
import {
  type GetRecommendationsDeps,
  getRecommendationsHandler,
} from "./recommendations/route.js"
import {
  type GetPatternWeightsDeps,
  getPatternWeightsHandler,
} from "./pattern-weights/route.js"

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

function createLimiter(windowMs: number, limit: number) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests" },
  })
}

const authLimiter = createLimiter(15 * 60 * 1000, 20)
const profileLimiter = createLimiter(60 * 60 * 1000, 10)
const readLimiter = createLimiter(60 * 1000, 120)

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

  app.post("/profiles", ...maybeLimit(profileLimiter), createProfileHandler(deps))
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
