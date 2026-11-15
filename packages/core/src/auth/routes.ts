import type { Express, RequestHandler } from "express"

const LIMITED_AUTH_PATHS = [
  "/api/auth/sign-in",
  "/api/auth/sign-up",
  "/api/auth/forget-password",
]

export function mountAuth(
  app: Express,
  { handler, limiter }: { handler: RequestHandler; limiter?: RequestHandler },
): void {
  if (limiter) {
    for (const path of LIMITED_AUTH_PATHS) app.use(path, limiter)
  }
  app.all("/api/auth/{*splat}", handler)
}
