import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { expo } from "@better-auth/expo"

import { db } from "./db/client.js"
import {
  parseExtraTrustedOrigins,
  resolveTrustedOrigins,
} from "./trusted-origins.js"

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set")
}

if (!process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL is not set")
}

export const trustedOrigins = resolveTrustedOrigins({
  extraTrustedOrigins: parseExtraTrustedOrigins(
    process.env.BETTER_AUTH_TRUSTED_ORIGINS,
  ),
  isProd: process.env.NODE_ENV === "production",
})

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [expo()],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
})
