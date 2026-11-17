import rateLimit from "express-rate-limit"

function createLimiter(windowMs: number, limit: number) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests" },
  })
}

export const authLimiter = createLimiter(15 * 60 * 1000, 20)
export const profileLimiter = createLimiter(60 * 60 * 1000, 10)
export const readLimiter = createLimiter(60 * 1000, 120)
