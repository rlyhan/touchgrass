import cors from "cors"
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express"
import rateLimit from "express-rate-limit"

import { auth, trustedOrigins } from "./auth.js"
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

export type AppDeps = CreateProfileDeps & GetRecommendationsDeps & GetActivityDeps

export type AppOptions = {
  disableRateLimits?: boolean
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests" },
})

const profileLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests" },
})

const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests" },
})

export function createApp(deps: AppDeps, options: AppOptions = {}): Express {
  const app = express()
  app.set("trust proxy", 1)
  app.use(
    cors({
      origin: trustedOrigins,
      credentials: true,
    }),
  )

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

  app.post(
    "/profiles",
    ...(options.disableRateLimits ? [] : [profileLimiter]),
    createProfileHandler(deps),
  )
  app.get(
    "/recommendations",
    ...(options.disableRateLimits ? [] : [readLimiter]),
    getRecommendationsHandler(deps),
  )
  app.get(
    "/activities/:slug",
    ...(options.disableRateLimits ? [] : [readLimiter]),
    getActivityHandler(deps),
  )

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
