export type TrustedOriginsOptions = {
  extraTrustedOrigins: string[]
  isProd: boolean
}

const DEV_TRUSTED_ORIGINS = [
  "http://localhost:8081",
  "http://localhost:19006",
  "http://localhost:19000",
]

const APP_SCHEME = "touchgrass://"

export function parseExtraTrustedOrigins(
  raw: string | undefined,
): string[] {
  return raw?.split(",").map((s) => s.trim()).filter(Boolean) ?? []
}

export function resolveTrustedOrigins({
  extraTrustedOrigins,
  isProd,
}: TrustedOriginsOptions): string[] {
  if (isProd) {
    const hasHttpsOrigin = extraTrustedOrigins.some((o) =>
      o.startsWith("https://"),
    )
    if (!hasHttpsOrigin) {
      throw new Error(
        "BETTER_AUTH_TRUSTED_ORIGINS must include at least one https:// origin in production",
      )
    }
    return [APP_SCHEME, ...extraTrustedOrigins]
  }
  return [APP_SCHEME, ...DEV_TRUSTED_ORIGINS, ...extraTrustedOrigins]
}
