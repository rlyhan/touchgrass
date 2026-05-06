import express, { type Express } from "express"

import { type CreateUserDeps, createUserHandler } from "./onboarding/route.js"

export type AppDeps = CreateUserDeps

export function createApp(deps: AppDeps): Express {
  const app = express()
  app.use(express.json())

  app.get("/health", (_req, res) => {
    res.json({ ok: true })
  })

  app.post("/users", createUserHandler(deps))

  return app
}
