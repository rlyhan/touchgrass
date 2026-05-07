import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { expo } from "@better-auth/expo"

import { db } from "./db/client.js"

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set")
}

const extraTrustedOrigins =
  process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? []

const isProd = process.env.NODE_ENV === "production"

const devTrustedOrigins = isProd
  ? []
  : [
      "http://localhost:8081",
      "http://localhost:19006",
      "http://localhost:19000",
    ]

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "touchgrass://",
    ...devTrustedOrigins,
    ...extraTrustedOrigins,
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [expo()],
})
