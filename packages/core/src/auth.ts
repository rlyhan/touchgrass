import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { bearer } from "better-auth/plugins"
import { expo } from "@better-auth/expo"

import { db } from "./db/client.js"
import { readAuthEnv } from "./auth-env.js"

const { secret, baseUrl, trustedOrigins, corsOrigins } = readAuthEnv(process.env)

export { corsOrigins }

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret,
  baseURL: baseUrl,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [expo(), bearer({ requireSignature: true })],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
})
