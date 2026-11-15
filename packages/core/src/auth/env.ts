import {
  parseExtraTrustedOrigins,
  resolveCorsOrigins,
  resolveTrustedOrigins,
} from "./trusted-origins.js"

export function readAuthEnv(env: NodeJS.ProcessEnv) {
  if (!env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is not set")
  }
  if (!env.BETTER_AUTH_URL) {
    throw new Error("BETTER_AUTH_URL is not set")
  }

  const trustedOrigins = resolveTrustedOrigins({
    extraTrustedOrigins: parseExtraTrustedOrigins(
      env.BETTER_AUTH_TRUSTED_ORIGINS,
    ),
    isProd: env.NODE_ENV === "production",
  })

  return {
    secret: env.BETTER_AUTH_SECRET,
    baseUrl: env.BETTER_AUTH_URL,
    trustedOrigins,
    corsOrigins: resolveCorsOrigins(trustedOrigins),
  }
}
