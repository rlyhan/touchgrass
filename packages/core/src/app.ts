import cors from "cors"
import express, {
  type Express,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express"
import rateLimit from "express-rate-limit"

import { auth, corsOrigins } from "./auth.js"
import { toNodeHandler } from "better-auth/node"
import {
  type GetActivityDeps,
  getActivityHandler,
} from "./activities/route.js"
import {
  type CreateProfileDeps,
  createProfileHandler,
} from "./onboarding/route.js"
import {
  type GetRecommendationsDeps,
  getRecommendationsHandler,
} from "./recommendations/route.js"
import {
  type GetPatternWeightsDeps,
  getPatternWeightsHandler,
} from "./patterns/route.js"

export type AppDeps = CreateProfileDeps &
  GetRecommendationsDeps &
  GetActivityDeps &
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
      origin: corsOrigins,
      credentials: true,
    }),
  )

  const maybeLimit = (limiter: RequestHandler): RequestHandler[] =>
    options.disableRateLimits ? [] : [limiter]

  if (!options.disableRateLimits) {
    app.use("/api/auth/sign-in", authLimiter)
    app.use("/api/auth/sign-up", authLimiter)
    app.use("/api/auth/forget-password", authLimiter)
  }

  app.all("/api/auth/{*splat}", toNodeHandler(auth))

  app.use(express.json())

  app.get("/health", (_req, res) => {
    res.json({ ok: true })
  })

  app.post("/profiles", ...maybeLimit(profileLimiter), createProfileHandler(deps))
  app.get("/recommendations", ...maybeLimit(readLimiter), getRecommendationsHandler(deps))
  app.get("/pattern-weights", ...maybeLimit(readLimiter), getPatternWeightsHandler(deps))
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
